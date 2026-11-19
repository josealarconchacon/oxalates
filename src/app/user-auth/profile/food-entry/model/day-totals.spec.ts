import { FoodItem, RecipeEntry } from '../service/food-entry.service';
import { dayTotals, itemTotals, localDayKey, mealTotals } from './day-totals';

const food = (perServing: number, solublePerServing: number, servings: number): FoodItem => ({
  foodName: 'Spinach',
  oxalatePerServing: perServing,
  solubleOxalatePerServing: solublePerServing,
  servingSize: '1 cup',
  numberOfServings: servings,
});

const recipe = (mg: number, solubleMg: number, incomplete = false, solubleIncomplete = false): RecipeEntry => ({
  kind: 'recipe',
  entryId: 'e1',
  snapshot: {
    recipeId: 'r1',
    recipeName: 'Soup',
    multiplier: 1,
    mg,
    solubleMg,
    level: 'Low',
    incomplete,
    solubleIncomplete,
    ingredients: [],
    dataUpdatedAt: '2024-07-27',
    loggedAt: '2026-11-18T12:00:00.000Z',
  },
  foodName: 'Soup',
  servingSize: 'recipe',
  numberOfServings: 1,
  oxalatePerServing: mg,
  solubleOxalatePerServing: solubleMg,
});

const day = (over: Partial<Record<'breakfast' | 'lunch' | 'dinner' | 'snacks', any[]>>) => ({
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
  ...over,
});

describe('day totals', () => {
  it('food only: the same numbers as before, never "at least"', () => {
    const t = dayTotals(day({ breakfast: [food(10, 4, 2)], snacks: [food(1.5, 0.5, 1)] }));
    expect(t).toEqual({ mg: 21.5, solubleMg: 8.5, atLeast: false, solubleAtLeast: false });
  });

  it('old food entries with missing numbers still count as 0, as before', () => {
    const broken = { foodName: 'Old', servingSize: '', numberOfServings: 1 } as unknown as FoodItem;
    expect(itemTotals(broken).mg).toBe(0);
  });

  it('food + a complete recipe: adds the snapshot mg', () => {
    const t = dayTotals(day({ lunch: [food(10, 4, 1)], dinner: [recipe(5.6, 2.8)] }));
    expect(t.mg).toBeCloseTo(15.6, 10);
    expect(t.solubleMg).toBeCloseTo(6.8, 10);
    expect(t.atLeast).toBeFalse();
  });

  it('a recipe uses its snapshot, not its food-style copy', () => {
    const r = { ...recipe(5, 2), oxalatePerServing: 999, numberOfServings: 9 };
    expect(itemTotals(r).mg).toBe(5);
  });

  it('an incomplete recipe makes the day "at least" (total and soluble)', () => {
    const t = dayTotals(day({ lunch: [food(10, 4, 1)], dinner: [recipe(3, 1, true)] }));
    expect(t).toEqual({ mg: 13, solubleMg: 5, atLeast: true, solubleAtLeast: true });
  });

  it('soluble missing on some recipe rows only: just soluble is "at least"', () => {
    const t = dayTotals(day({ dinner: [recipe(3, 1, false, true)] }));
    expect(t.atLeast).toBeFalse();
    expect(t.solubleAtLeast).toBeTrue();
  });

  it('an all-unknown recipe adds 0 mg but is never a plain 0', () => {
    const t = dayTotals(day({ snacks: [recipe(0, 0, true)] }));
    expect(t).toEqual({ mg: 0, solubleMg: 0, atLeast: true, solubleAtLeast: true });
  });

  it('meal totals follow the same rule', () => {
    expect(mealTotals([food(2, 1, 1), recipe(1, 1, true)]).atLeast).toBeTrue();
    expect(mealTotals(undefined).mg).toBe(0);
  });

  it('localDayKey is the local calendar date', () => {
    expect(localDayKey(new Date(2026, 10, 14, 23, 30))).toBe('2026-11-14');
    expect(localDayKey(new Date(2026, 0, 2, 0, 5))).toBe('2026-01-02');
  });
});
