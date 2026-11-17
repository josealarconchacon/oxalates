import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { RecipeIngredient } from '../model/recipe';
import { foodValues } from './food-values';

/** A unit the amount can be entered in. */
export interface UnitOption {
  unit: 'g' | 'serving';
  /** e.g. "g", "1 cup (195 g)", "2 scoops" */
  label: string;
  /** The household measure, e.g. "1 cup" (serving only). */
  servingLabel: string | null;
  /** Weight of one household serving; null when unknown. */
  servingGrams: number | null;
}

/**
 * "g" always; the food's household measure only when the engine can turn it
 * into mg (a measured mg per serving, or per 100 g plus a serving weight).
 */
export function unitOptions(food: Oxalate | undefined): UnitOption[] {
  const options: UnitOption[] = [{ unit: 'g', label: 'g', servingLabel: null, servingGrams: null }];
  if (!food) return options;
  const v = foodValues(food);
  const usable = v.mgPerServing !== null || (v.mgPer100g !== null && v.servingGrams !== null);
  if (v.servingLabel && usable) {
    options.push({
      unit: 'serving',
      label: v.servingGrams !== null ? `${v.servingLabel} (${formatGrams(v.servingGrams)} g)` : v.servingLabel,
      servingLabel: v.servingLabel,
      servingGrams: v.servingGrams,
    });
  }
  return options;
}

/** Grams without trailing zeros: 195, 13.5. */
export function formatGrams(grams: number): string {
  return String(Math.round(grams * 10) / 10);
}

/** "120 g", "2 × 1 cup (195 g) · 390 g", or "2 × 2 scoops" (no weight). */
export function describeAmount(ingredient: RecipeIngredient, servingGrams: number | null): string {
  if (ingredient.inputUnit === 'g') {
    return ingredient.grams !== null ? `${formatGrams(ingredient.grams)} g` : '';
  }
  const label = ingredient.servingLabel ?? 'serving';
  const count = formatGrams(ingredient.inputAmount);
  if (servingGrams === null) return `${count} × ${label}`;
  return `${count} × ${label} (${formatGrams(servingGrams)} g) · ${formatGrams(servingGrams * ingredient.inputAmount)} g`;
}
