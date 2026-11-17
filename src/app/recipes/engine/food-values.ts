import { Oxalate } from 'src/app/landing-page/model/oxalate';

/** The numbers the recipe math needs from one food. null = unknown. */
export interface FoodValues {
  mgPer100g: number | null;
  solublePer100g: number | null;
  mgPerServing: number | null;
  solublePerServing: number | null;
  /** Weight of one household serving; null when the data has none. */
  servingGrams: number | null;
  /** e.g. "1/2 cup"; null when the data has none. */
  servingLabel: string | null;
  /** mgPer100g was worked out from mg per serving ÷ serving grams. */
  derived: boolean;
  solubleDerived: boolean;
}

/**
 * A value from the food list as a number, or null when it's unknown.
 * "Neg" (negligible, a measured result) is 0. Everything that isn't a
 * number ("uncalculated", "n/a", "-", "unc", null) is unknown, never 0.
 */
export function parseAmount(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim();
  if (/^neg$/i.test(text)) return 0;
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  return Number(text);
}

export function foodValues(food: Oxalate): FoodValues {
  // "uncalculated" foods carry a placeholder "0.00" per serving.
  const uncalculated = String(food.calc_level).trim().toLowerCase() === 'uncalculated';
  const servingGrams = positiveOrNull(parseAmount(food.serving_g));
  const label = (food.serving_size ?? '').trim();
  const servingLabel = label && !/^unk/i.test(label) ? label : null;

  const mgPerServing = uncalculated ? null : parseAmount(food.calc_oxalate_per_serving);
  let mgPer100g = parseAmount(food.total_oxalate_mg_per_100g);
  let derived = false;
  if (mgPer100g === null && mgPerServing !== null && servingGrams !== null) {
    mgPer100g = (mgPerServing / servingGrams) * 100;
    derived = true;
  }

  let solublePer100g = parseAmount(food.total_soluble_oxalate_mg_per_100g);
  let solublePerServing = uncalculated
    ? null
    : parseAmount(food.calc_soluble_mg_oxalate_per_serving);
  // With no soluble per 100 g, a "0.00" per serving is a placeholder
  // ("Soluble oxalate levels not calculated"), not a measurement.
  if (solublePer100g === null && solublePerServing === 0) solublePerServing = null;
  let solubleDerived = false;
  if (solublePer100g === null && solublePerServing !== null && servingGrams !== null) {
    solublePer100g = (solublePerServing / servingGrams) * 100;
    solubleDerived = true;
  }

  return {
    mgPer100g,
    solublePer100g,
    mgPerServing,
    solublePerServing,
    servingGrams,
    servingLabel,
    derived,
    solubleDerived,
  };
}

function positiveOrNull(n: number | null): number | null {
  return n !== null && n > 0 ? n : null;
}
