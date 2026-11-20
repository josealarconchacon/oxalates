import { calculateRecipe } from '../../engine/recipe-calculator';
import { levelForMgPerServing } from '../../engine/recipe-level';
import { FAKE_FOODS, fakeRecipes } from '../../engine/testing/fake-recipes';
import { Recipe, RecipeResult } from '../../model/recipe';
import {
  ListItem,
  SORT_OPTIONS,
  countLine,
  isSortKey,
  matchesQuery,
  matchesTags,
  normalize,
  tagOptions,
  sortItems,
  toListItem,
  visibleItems,
} from './list-query';

/** A list item with exactly the numbers a test needs (no engine). */
function item(
  name: string,
  perServingMg: number,
  opts: { incomplete?: boolean; allUnknown?: boolean; updatedAt?: string; tags?: string[]; ingredients?: string[] } = {}
): ListItem {
  const recipe = {
    id: name,
    ownerId: 'u1',
    name,
    serves: 1,
    ingredients: (opts.ingredients ?? []).map((n, i) => ({ id: 'i' + i, source: 'custom', name: n, grams: 10, inputAmount: 10, inputUnit: 'g' })),
    notes: '',
    tags: opts.tags ?? [],
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: opts.updatedAt ?? '2026-11-01T00:00:00.000Z',
  } as Recipe;
  const result = {
    perServingMg,
    incomplete: !!opts.incomplete || !!opts.allUnknown,
    allUnknown: !!opts.allUnknown,
    level: opts.allUnknown ? null : 'Low',
  } as RecipeResult;
  return toListItem(recipe, result);
}

const names = (list: ListItem[]) => list.map((i) => i.recipe.name);

describe('list query: sort options and count', () => {
  it('Lowest oxalate first is the default (first) option', () => {
    expect(SORT_OPTIONS[0].label).toBe('Lowest oxalate first');
  });

  it('count line', () => {
    expect(countLine(0, 'name')).toBe('0 recipes · sorted by name');
    expect(countLine(1, 'lowest')).toBe('1 recipe · sorted by oxalate per serving');
    expect(countLine(12, 'highest')).toBe('12 recipes · sorted by oxalate per serving');
    expect(countLine(3, 'edited')).toBe('3 recipes · sorted by last edited');
  });

  it('only known sort keys are accepted', () => {
    expect(isSortKey('name')).toBeTrue();
    expect(isSortKey('random')).toBeFalse();
  });
});

describe('list query: search', () => {
  const soup = item('Crème Brûlée Soup', 5, { tags: ['Holiday'], ingredients: ['Carrots, raw', 'Jalapeño'] });

  it('normalize: lower case, no accents', () => {
    expect(normalize('Crème BRÛLÉE')).toBe('creme brulee');
  });

  it('matches the name, tags and ingredient names, ignoring case and accents', () => {
    expect(matchesQuery(soup, 'creme')).toBeTrue();
    expect(matchesQuery(soup, 'BRULEE')).toBeTrue();
    expect(matchesQuery(soup, 'holiday')).toBeTrue();
    expect(matchesQuery(soup, 'jalapeno')).toBeTrue();
    expect(matchesQuery(soup, 'carrot')).toBeTrue();
  });

  it('every word must match somewhere; anything else misses', () => {
    expect(matchesQuery(soup, 'soup carrot')).toBeTrue();
    expect(matchesQuery(soup, 'soup kale')).toBeFalse();
    expect(matchesQuery(soup, 'pizza')).toBeFalse();
  });
});

describe('list query: sort', () => {
  const list = [
    item('Bread', 12),
    item('Mystery', 0, { allUnknown: true }),
    item('apple tart', 3),
    item('Stew', 3, { incomplete: true }),
    item('Zest', 40),
    item('Another mystery', 0, { allUnknown: true }),
  ];

  it('Lowest first: by per-serving mg (incomplete by its known value), ties by name, unknown last', () => {
    expect(names(sortItems(list, 'lowest'))).toEqual(['apple tart', 'Stew', 'Bread', 'Zest', 'Another mystery', 'Mystery']);
  });

  it('Highest first: unknown still last', () => {
    expect(names(sortItems(list, 'highest'))).toEqual(['Zest', 'Bread', 'apple tart', 'Stew', 'Another mystery', 'Mystery']);
  });

  it('Recently edited: newest first, ties by name', () => {
    const edited = [
      item('Old', 1, { updatedAt: '2026-01-01T00:00:00.000Z' }),
      item('New B', 1, { updatedAt: '2026-11-18T00:00:00.000Z' }),
      item('New A', 1, { updatedAt: '2026-11-18T00:00:00.000Z' }),
    ];
    expect(names(sortItems(edited, 'edited'))).toEqual(['New A', 'New B', 'Old']);
  });

  it('Name A–Z: ignores case and accents, numbers in order', () => {
    const named = [item('soup 10', 1), item('Éclair', 1), item('Soup 2', 1), item('apple', 1)];
    expect(names(sortItems(named, 'name'))).toEqual(['apple', 'Éclair', 'Soup 2', 'soup 10']);
  });

  it('never changes the list it was given', () => {
    const before = names(list);
    sortItems(list, 'name');
    expect(names(list)).toEqual(before);
  });
});

describe('list query: 500 recipes', () => {
  it('builds, searches and sorts quickly, with unknown recipes last', () => {
    const items = fakeRecipes(500).map((r) => toListItem(r, calculateRecipe(r, FAKE_FOODS, levelForMgPerServing)));
    const start = performance.now();
    for (const sort of ['lowest', 'highest', 'edited', 'name'] as const) visibleItems(items, 'soup', sort);
    const lowest = visibleItems(items, '', 'lowest');
    const elapsed = performance.now() - start;

    expect(lowest.length).toBe(500);
    const firstUnknown = lowest.findIndex((i) => i.allUnknown);
    expect(firstUnknown).toBe(500 - 20); // every 25th recipe is all-unknown: 20 of them, at the end
    expect(lowest.slice(firstUnknown).every((i) => i.allUnknown)).toBeTrue();
    for (let k = 1; k < firstUnknown; k++) {
      expect(lowest[k].result.perServingMg).toBeGreaterThanOrEqual(lowest[k - 1].result.perServingMg);
    }
    expect(elapsed).toBeLessThan(250);
  });
});

describe('list query: tags', () => {
  const a = item('A', 1, { tags: ['Gluten-free', 'Holiday', 'party food'] });
  const b = item('B', 2, { tags: ['gluten-free', 'Zesty'] });
  const c = item('C', 3, { tags: [] });

  it('chips: the six suggested tags always, then your own A–Z, one per spelling', () => {
    expect(tagOptions([a, b, c])).toEqual([
      'Low histamine',
      'Gluten-free',
      'Dairy-free',
      'Low FODMAP',
      'Drink/Smoothie',
      'Holiday',
      'party food',
      'Zesty',
    ]);
    expect(tagOptions([])).toEqual(['Low histamine', 'Gluten-free', 'Dairy-free', 'Low FODMAP', 'Drink/Smoothie', 'Holiday']);
  });

  it('several chosen tags: the recipe must have ALL of them (any case)', () => {
    expect(matchesTags(a, ['Gluten-free'])).toBeTrue();
    expect(matchesTags(b, ['Gluten-free'])).toBeTrue();
    expect(matchesTags(a, ['Gluten-free', 'Holiday'])).toBeTrue();
    expect(matchesTags(b, ['Gluten-free', 'Holiday'])).toBeFalse();
    expect(matchesTags(c, [])).toBeTrue();
  });

  it('tags and search work together', () => {
    expect(names(visibleItems([a, b, c], '', 'name', ['Gluten-free']))).toEqual(['A', 'B']);
    expect(names(visibleItems([a, b, c], 'b', 'name', ['Gluten-free']))).toEqual(['B']);
    expect(names(visibleItems([a, b, c], '', 'name', ['Gluten-free', 'Zesty']))).toEqual(['B']);
  });
});
