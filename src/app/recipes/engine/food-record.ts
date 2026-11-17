import { Recipe, RecipeResult } from '../model/recipe';
import { LEVEL_NUMBERS } from './recipe-level';

/** One entry in the same shape (and string conventions) as oxolateListData.json. */
export interface FoodRecord {
  category: string;
  calc_level: string;
  level: string;
  item: string;
  total_oxalate_mg_per_100g: string;
  total_soluble_oxalate_mg_per_100g: string | null;
  serving_size: string | null;
  serving_g: string | null;
  calc_oxalate_per_serving: string;
  calc_soluble_mg_oxalate_per_serving: string;
  soluble_oxalate: string;
  reference: string;
  notes: string;
  id: string;
}

const UNCALCULATED = 'uncalculated';
const two = (n: number) => n.toFixed(2);

/**
 * A recipe as if it were a food in the list: one serving = the whole
 * recipe ÷ serves. Follows the list's conventions: numbers as 2-decimal
 * strings, "uncalculated" for unknown oxalate, null for a missing weight
 * or soluble per 100 g. An incomplete recipe keeps the level of its known
 * part and says so in `notes` (the list has no "at least").
 */
export function toFoodRecord(
  recipe: Pick<Recipe, 'id' | 'name' | 'serves' | 'notes'>,
  result: RecipeResult
): FoodRecord {
  const serves = recipe.serves >= 1 ? recipe.serves : 1;
  const rows = result.breakdown;
  const noValue = rows.length === 0 || result.allUnknown;
  const solubleUnknown = !rows.some((r) => r.solubleMg !== null);
  // Per 100 g needs the weight of every ingredient.
  const gramsKnown = rows.length > 0 && rows.every((r) => r.grams !== null);
  const totalGrams = rows.reduce((sum, r) => sum + (r.grams ?? 0), 0);
  const per100 = (mg: number) => two((mg / totalGrams) * 100);
  const hasWeight = gramsKnown && totalGrams > 0;

  const calcLevel = noValue ? UNCALCULATED : (result.level ?? UNCALCULATED);
  const incomplete = result.incomplete && !noValue
    ? `Incomplete: no oxalate value for ${result.unknownIngredients.map((u) => u.name).join(', ')}.`
    : '';

  return {
    category: 'Recipe',
    calc_level: calcLevel,
    level: LEVEL_NUMBERS[calcLevel] ?? LEVEL_NUMBERS[UNCALCULATED],
    item: recipe.name,
    total_oxalate_mg_per_100g: !noValue && hasWeight ? per100(result.totalMg) : UNCALCULATED,
    total_soluble_oxalate_mg_per_100g:
      !noValue && !solubleUnknown && hasWeight ? per100(result.totalSolubleMg) : null,
    serving_size: `1 serving (of ${serves})`,
    serving_g: hasWeight ? two(totalGrams / serves) : null,
    calc_oxalate_per_serving: noValue ? UNCALCULATED : two(result.perServingMg),
    calc_soluble_mg_oxalate_per_serving:
      noValue || solubleUnknown ? UNCALCULATED : two(result.perServingSolubleMg),
    soluble_oxalate: '',
    reference: 'Your recipe',
    notes: [incomplete, recipe.notes?.trim()].filter(Boolean).join(' '),
    id: recipe.id,
  };
}
