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
