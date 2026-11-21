import { formatMg } from '../../engine/format';
import { Recipe, RecipeResult } from '../../model/recipe';
import { SUGGESTED_TAGS } from '../../model/recipe-tags';

/** How the Recipes list is ordered. The first one is the default. */
export type SortKey = 'lowest' | 'highest' | 'edited' | 'name';

export const SORT_OPTIONS: { key: SortKey; label: string; phrase: string }[] = [
  { key: 'lowest', label: 'Lowest oxalate first', phrase: 'oxalate per serving, lowest first' },
  { key: 'highest', label: 'Highest oxalate first', phrase: 'oxalate per serving, highest first' },
  { key: 'edited', label: 'Recently edited', phrase: 'last edited' },
  { key: 'name', label: 'Name A–Z', phrase: 'name' },
];

export const DEFAULT_SORT: SortKey = 'lowest';

export function isSortKey(value: unknown): value is SortKey {
  return SORT_OPTIONS.some((o) => o.key === value);
}

/** "6 recipes · sorted by oxalate per serving, lowest first"; "1 recipe · …". */
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
  /** Name, tags and ingredient names, normalized once for search. */
  searchText: string;
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
  const searchText = normalize(
    [recipe.name, ...(recipe.tags ?? []), ...(recipe.ingredients ?? []).map((i) => i.name)].join('\n')
  );
  return { recipe, result, perServing, allUnknown, incomplete, level, label: parts.join(', '), searchText };
}

/** Lower case, accents removed: "Crème Brûlée" → "creme brulee". */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Every word of the query appears in the name, a tag or an ingredient. */
export function matchesQuery(item: ListItem, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return words.every((w) => item.searchText.includes(w));
}

const byName = (a: ListItem, b: ListItem) =>
  a.recipe.name.localeCompare(b.recipe.name, undefined, { sensitivity: 'base', numeric: true });

/**
 * A sorted copy. Oxalate sorts use the engine's per-serving mg (the known,
 * "at least" value for incomplete recipes); recipes with no known value at
 * all always go last. Ties: name A–Z.
 */
export function sortItems(items: ListItem[], sort: SortKey): ListItem[] {
  const copy = [...items];
  const mg = (i: ListItem) => i.result.perServingMg;
  switch (sort) {
    case 'lowest':
    case 'highest': {
      const dir = sort === 'lowest' ? 1 : -1;
      return copy.sort(
        (a, b) => Number(a.allUnknown) - Number(b.allUnknown) || (a.allUnknown ? 0 : dir * (mg(a) - mg(b))) || byName(a, b)
      );
    }
    case 'edited':
      return copy.sort((a, b) => (b.recipe.updatedAt ?? '').localeCompare(a.recipe.updatedAt ?? '') || byName(a, b));
    case 'name':
      return copy.sort(byName);
  }
}

/**
 * The tag chips: the six suggested tags (always), then every other tag used
 * on your recipes, A–Z. Tags that differ only in case count as one.
 */
export function tagOptions(items: ListItem[]): string[] {
  const seen = new Set(SUGGESTED_TAGS.map((t) => t.toLowerCase()));
  const custom = new Map<string, string>();
  for (const item of items) {
    for (const tag of item.recipe.tags ?? []) {
      const key = tag.trim().toLowerCase();
      if (key && !seen.has(key) && !custom.has(key)) custom.set(key, tag.trim());
    }
  }
  const mine = [...custom.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  return [...SUGGESTED_TAGS, ...mine];
}

/** The recipe has ALL the chosen tags (none chosen: every recipe). */
export function matchesTags(item: ListItem, tags: string[]): boolean {
  if (!tags.length) return true;
  const own = new Set((item.recipe.tags ?? []).map((t) => t.trim().toLowerCase()));
  return tags.every((t) => own.has(t.toLowerCase()));
}

/** What the list shows: matches for the query and tags, in the chosen order. */
export function visibleItems(items: ListItem[], query: string, sort: SortKey, tags: string[] = []): ListItem[] {
  const matching = items.filter((i) => (!query.trim() || matchesQuery(i, query)) && matchesTags(i, tags));
  return sortItems(matching, sort);
}

/** The first `max` tags, and how many more there are ("+2"). */
export function visibleTags(tags: string[] | undefined, max: number): { shown: string[]; more: number } {
  const all = tags ?? [];
  return { shown: all.slice(0, max), more: Math.max(0, all.length - max) };
}

/** The list's view as it lives in the URL: ?q=&sort=&tags=a&tags=b. */
export interface ListView {
  q: string;
  /** Null when the URL doesn't say (then the remembered sort, or the default, applies). */
  sort: SortKey | null;
  tags: string[];
}

/** Reads the view from query params (unknown sorts and empty values are ignored). */
export function viewFromParams(get: (key: string) => string | null, getAll: (key: string) => string[]): ListView {
  const sort = get('sort');
  return {
    q: get('q') ?? '',
    sort: isSortKey(sort) ? sort : null,
    tags: getAll('tags').map((t) => t.trim()).filter(Boolean),
  };
}

/** Query params for the view; defaults are left out so plain /recipes stays plain. */
export function paramsFromView(view: { q: string; sort: SortKey; tags: string[] }): Record<string, string | string[] | null> {
  return {
    q: view.q.trim() || null,
    sort: view.sort === DEFAULT_SORT ? null : view.sort,
    tags: view.tags.length ? view.tags : null,
  };
}

/** URL tags in the chips' own spelling ("holiday" → "Holiday"); tags with no chip are dropped. */
export function matchTagOptions(tags: string[], options: string[]): string[] {
  const byKey = new Map(options.map((o) => [o.toLowerCase(), o]));
  const out: string[] = [];
  for (const t of tags) {
    const match = byKey.get(t.toLowerCase());
    if (match && !out.includes(match)) out.push(match);
  }
  return out;
}
