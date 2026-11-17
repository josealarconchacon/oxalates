/**
 * Recipe levels. The app has no mg → level function (each food's level is
 * text in the data), so the ranges are passed in. RECIPE_LEVEL_RANGES stays
 * null until the ranges are agreed; until then recipes have no level.
 */

/** A level applies from the previous range's `below` up to (not incl.) its own. */
export interface LevelRange {
  level: string;
  below: number;
}

export const RECIPE_LEVEL_RANGES: LevelRange[] | null = null;

export function levelForMgPerServing(
  mg: number,
  ranges: LevelRange[] | null = RECIPE_LEVEL_RANGES
): string | null {
  if (!ranges?.length || !Number.isFinite(mg) || mg < 0) return null;
  const sorted = [...ranges].sort((a, b) => a.below - b.below);
  return sorted.find((r) => mg < r.below)?.level ?? sorted[sorted.length - 1].level;
}
