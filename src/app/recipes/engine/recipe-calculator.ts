import { Oxalate } from 'src/app/landing-page/model/oxalate';
import {
  IngredientBreakdown,
  Recipe,
  RecipeIngredient,
  RecipeResult,
} from '../model/recipe';
import { foodValues } from './food-values';

/** Looks a food up by its id in the oxalate list. */
export type FoodLookup = (foodId: string) => Oxalate | undefined;
/** Turns mg per serving into a level, or null when there are no ranges. */
export type LevelOf = (mgPerServing: number) => string | null;

/**
 * One ingredient's mg and soluble mg. null = unknown, never 0.
 *
 * Grams: mg = mg per 100 g × grams ÷ 100.
 * Household measure ('serving'): mg = the food's measured mg per serving ×
 * count, and grams = serving grams × count (null without a weight). The
 * measured value is used because per 100 g can describe a different state
 * (e.g. dry tea leaves vs. a brewed cup).
 */
export function calculateIngredient(
  ingredient: RecipeIngredient,
  getFood: FoodLookup
): IngredientBreakdown {
  const row: IngredientBreakdown = {
    ingredientId: ingredient.id,
    name: ingredient.name,
    grams: ingredient.inputUnit === 'g' ? ingredient.grams : null,
    mg: null,
    solubleMg: null,
    sharePercent: null,
    known: false,
    isYourValue: false,
    derived: false,
  };

  if (ingredient.source === 'custom') {
    const per100 = ingredient.customMgPer100g;
    if (per100 !== undefined && Number.isFinite(per100) && per100 >= 0 && row.grams !== null) {
      row.mg = (per100 * row.grams) / 100;
      row.isYourValue = true;
    }
    row.known = row.mg !== null;
    return row;
  }

  const food = ingredient.foodId ? getFood(ingredient.foodId) : undefined;
  if (!food) return row; // not in the list (any more): unknown
  const v = foodValues(food);

  if (ingredient.inputUnit === 'g') {
    const g = ingredient.grams;
    if (g !== null) {
      row.mg = v.mgPer100g !== null ? (v.mgPer100g * g) / 100 : null;
      row.solubleMg = v.solublePer100g !== null ? (v.solublePer100g * g) / 100 : null;
      row.derived = row.mg !== null && v.derived;
    }
  } else {
    const count = ingredient.inputAmount;
    row.grams = v.servingGrams !== null ? v.servingGrams * count : null;
    row.mg = perServing(v.mgPerServing, v.mgPer100g, v.servingGrams, count);
    row.solubleMg = perServing(v.solublePerServing, v.solublePer100g, v.servingGrams, count);
  }
  row.known = row.mg !== null;
  return row;
}

/** Totals, per serving, flags and the breakdown for a whole recipe. */
export function calculateRecipe(
  recipe: Pick<Recipe, 'serves' | 'ingredients'>,
  getFood: FoodLookup,
  levelOf?: LevelOf
): RecipeResult {
  const rows = recipe.ingredients.map((i) => calculateIngredient(i, getFood));
  const known = rows.filter((r) => r.known);
  const totalMg = sum(known.map((r) => r.mg!));
  const totalSolubleMg = sum(rows.map((r) => r.solubleMg ?? 0));
  const serves = recipe.serves >= 1 ? recipe.serves : 1;

  for (const r of known) {
    r.sharePercent = totalMg > 0 ? (r.mg! / totalMg) * 100 : 0;
  }
  // Highest mg first; unknown rows keep their order at the end.
  const breakdown = [...known.sort((a, b) => b.mg! - a.mg!), ...rows.filter((r) => !r.known)];

  const allUnknown = rows.length > 0 && known.length === 0;
  const perServingMg = totalMg / serves;
  return {
    totalMg,
    perServingMg,
    totalSolubleMg,
    perServingSolubleMg: totalSolubleMg / serves,
    level: levelOf && !allUnknown && rows.length > 0 ? levelOf(perServingMg) : null,
    incomplete: known.length < rows.length,
    unknownIngredients: rows.filter((r) => !r.known).map((r) => ({ id: r.ingredientId, name: r.name })),
    includesYourValues: rows.some((r) => r.isYourValue),
    solubleIncomplete: rows.some((r) => r.solubleMg === null),
    allUnknown,
    breakdown,
  };
}

function perServing(
  measured: number | null,
  per100: number | null,
  servingGrams: number | null,
  count: number
): number | null {
  if (measured !== null) return measured * count;
  if (per100 !== null && servingGrams !== null) return ((per100 * servingGrams) / 100) * count;
  return null;
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
