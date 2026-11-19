import { formatMg } from 'src/app/recipes/engine/format';
import { servingsLabel } from '../recipe-entry/recipe-entry.component';
import { DayItem, isRecipeEntry } from '../service/food-entry.service';
import { itemTotals } from './day-totals';

/** "at least " when the number is a minimum. */
const atLeast = (yes: boolean) => (yes ? 'at least ' : '');

/**
 * One row of the CSV / PDF table: Meal, Food Name, Serving Size, Servings,
 * Oxalate (mg), Soluble Oxalate (mg). Food rows are exactly what the report
 * always produced; recipe rows come from the saved snapshot.
 */
export function reportRow(item: DayItem, meal: string): [string, string, string, string | number, string, string] {
  if (isRecipeEntry(item)) {
    const s = item.snapshot;
    const t = itemTotals(item);
    return [
      meal,
      s.recipeName,
      'Recipe',
      servingsLabel(s.multiplier),
      atLeast(t.atLeast) + t.mg.toFixed(2),
      atLeast(t.solubleAtLeast) + t.solubleMg.toFixed(2),
    ];
  }
  return [
    meal,
    item.foodName,
    item.servingSize,
    item.numberOfServings,
    (item.oxalatePerServing * item.numberOfServings).toFixed(2),
    (item.solubleOxalatePerServing * item.numberOfServings).toFixed(2),
  ];
}

/** "1234.56" or "at least 1234.56", for the report's Total row. */
export function reportTotal(mg: number, isAtLeast: boolean): string {
  return atLeast(isAtLeast) + mg.toFixed(2);
}

/**
 * A recipe's line in the share text. (Food lines keep their original format,
 * written by the share menu.)
 */
export function shareRecipeLine(item: DayItem): string | null {
  if (!isRecipeEntry(item)) return null;
  const s = item.snapshot;
  const t = itemTotals(item);
  return (
    `    - 📖 ${s.recipeName} (Recipe · ${servingsLabel(s.multiplier)}): ` +
    `${atLeast(t.atLeast)}${formatMg(t.mg)}mg oxalate, ${atLeast(t.solubleAtLeast)}${formatMg(t.solubleMg)}mg soluble oxalate\n`
  );
}
