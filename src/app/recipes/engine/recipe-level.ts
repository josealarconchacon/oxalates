/**
 * Recipe levels, per serving. The food list has no mg → level function (each
 * food's level is text from its source), so these ranges were fitted to the
 * list itself: they give the same calc_level as the data for 96.3% of the
 * foods that have a per-serving value (checked Nov 2026).
 */

/** A level applies from the previous range's `below` up to (not incl.) its own. */
export interface LevelRange {
  level: string;
  below: number;
}

export const RECIPE_LEVEL_RANGES: LevelRange[] | null = [
  { level: 'Very Low', below: 1 },
  { level: 'Low', below: 5 },
  { level: 'Medium', below: 15 },
  { level: 'High', below: 20 },
  { level: 'Very High', below: 40 },
  { level: 'Extremely High', below: Infinity },
];

/** The food list's `calc_level` → `level` pairing ("Low" is always "2"). */
export const LEVEL_NUMBERS: Record<string, string> = {
  'Very Low': '1',
  Low: '2',
  Medium: '3',
  High: '4',
  'Very High': '5',
  'Extremely High': '6',
  uncalculated: '7',
};

export function levelForMgPerServing(
  mg: number,
  ranges: LevelRange[] | null = RECIPE_LEVEL_RANGES
): string | null {
  if (!ranges?.length || !Number.isFinite(mg) || mg < 0) return null;
  const sorted = [...ranges].sort((a, b) => a.below - b.below);
  return sorted.find((r) => mg < r.below)?.level ?? sorted[sorted.length - 1].level;
}
