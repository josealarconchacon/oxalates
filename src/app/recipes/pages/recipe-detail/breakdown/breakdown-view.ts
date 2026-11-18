import { formatMg, formatShare } from '../../../engine/format';
import { FoodLookup } from '../../../engine/recipe-calculator';
import { formatGrams } from '../../../engine/units';
import { Recipe, RecipeResult } from '../../../model/recipe';

/** One "What's driving this" row, as text. */
export interface BreakdownRowView {
  ingredientId: string;
  name: string;
  /** "390 g", or "2 × 1/2 cup" when the weight is unknown. */
  amount: string;
  known: boolean;
  /** "12.4" (no unit); empty for unknown rows. */
  mg: string;
  /** "45%" or "—". */
  share: string;
  /** Bar width in %, at least 1 when the share is above 0. */
  barWidth: number;
  ariaLabel: string;
  /** "Source: …", "Your own ingredient", "No longer in the food list", or ''. */
  source: string;
  /** The food was removed from the list: explain it even with sources off. */
  missingFood: boolean;
}

/** Rows in the engine's order (highest first, unknown last). Display only. */
export function breakdownRows(recipe: Recipe, result: RecipeResult, getFood: FoodLookup): BreakdownRowView[] {
  const byId = new Map(recipe.ingredients.map((i) => [i.id, i]));
  return result.breakdown.map((row) => {
    const ingredient = byId.get(row.ingredientId);
    const amount =
      row.grams !== null
        ? `${formatGrams(row.grams)} g`
        : ingredient
          ? `${formatGrams(ingredient.inputAmount)} × ${ingredient.servingLabel ?? 'serving'}`
          : '';
    const known = row.known && row.mg !== null;
    const share = row.sharePercent ?? 0;
    const mg = known ? formatMg(row.mg!) : '';
    const pct = known ? Math.round(share) : null;
    return {
      ingredientId: row.ingredientId,
      name: row.name,
      amount,
      known,
      mg,
      share: known ? formatShare(share) : '—',
      barWidth: !known ? 0 : share > 0 ? Math.max(1, share) : 0,
      source: sourceLine(ingredient, getFood),
      missingFood: ingredient?.source === 'database' && !(ingredient.foodId && getFood(ingredient.foodId)),
      ariaLabel: [row.name, amount, ...(known ? [`${mg} mg`, `${pct} percent of total`] : ['oxalate unknown'])]
        .filter(Boolean)
        .join(', '),
    };
  });
}

function sourceLine(ingredient: Recipe['ingredients'][number] | undefined, getFood: FoodLookup): string {
  if (!ingredient) return '';
  if (ingredient.source === 'custom') return 'Your own ingredient';
  const food = ingredient.foodId ? getFood(ingredient.foodId) : undefined;
  if (!food) return 'No longer in the food list';
  const reference = (food.reference ?? '').trim();
  return reference ? `Source: ${reference}` : '';
}
