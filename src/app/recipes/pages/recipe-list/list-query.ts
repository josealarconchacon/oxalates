import { formatMg } from '../../engine/format';
import { Recipe, RecipeResult } from '../../model/recipe';

/** How the Recipes list is ordered. The first one is the default. */
export type SortKey = 'lowest' | 'highest' | 'edited' | 'name';

export const SORT_OPTIONS: { key: SortKey; label: string; phrase: string }[] = [
  { key: 'lowest', label: 'Lowest oxalate first', phrase: 'oxalate per serving' },
  { key: 'highest', label: 'Highest oxalate first', phrase: 'oxalate per serving' },
  { key: 'edited', label: 'Recently edited', phrase: 'last edited' },
  { key: 'name', label: 'Name A–Z', phrase: 'name' },
];

export const DEFAULT_SORT: SortKey = 'lowest';

export function isSortKey(value: unknown): value is SortKey {
  return SORT_OPTIONS.some((o) => o.key === value);
}

/** "6 recipes · sorted by oxalate per serving"; "1 recipe · …". */
export function countLine(count: number, sort: SortKey): string {
  const phrase = SORT_OPTIONS.find((o) => o.key === sort)!.phrase;
  return `${count} ${count === 1 ? 'recipe' : 'recipes'} · sorted by ${phrase}`;
}

/**
 * One recipe on the list, worked out once per load: the engine result and
 * the text the card / row shows. Display only; no new math.
 */
export interface ListItem {
  recipe: Recipe;
  result: RecipeResult;
  /** "5.6" (no unit). */
  perServing: string;
  /** No ingredient has a value: show "Unknown", never 0. */
  allUnknown: boolean;
  incomplete: boolean;
  level: string | null;
  /** The link's accessible name, e.g. "Lemon herb chicken, 5.6 mg per serving, Low". */
  label: string;
}

export function toListItem(recipe: Recipe, result: RecipeResult): ListItem {
  const perServing = formatMg(result.perServingMg);
  const allUnknown = result.allUnknown;
  const incomplete = result.incomplete;
  const level = allUnknown ? null : result.level;
  const amount = allUnknown
    ? 'oxalate per serving unknown'
    : `${incomplete ? 'at least ' : ''}${perServing} mg per serving`;
  const parts = [recipe.name, amount];
  if (level) parts.push(`${incomplete ? 'at least ' : ''}${level}`);
  if (incomplete) parts.push('incomplete');
  return { recipe, result, perServing, allUnknown, incomplete, level, label: parts.join(', ') };
}

/** The first `max` tags, and how many more there are ("+2"). */
export function visibleTags(tags: string[] | undefined, max: number): { shown: string[]; more: number } {
  const all = tags ?? [];
  return { shown: all.slice(0, max), more: Math.max(0, all.length - max) };
}
