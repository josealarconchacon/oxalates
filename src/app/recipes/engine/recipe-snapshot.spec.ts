import { FOOD_DATA_UPDATED_AT } from '../model/recipe';
import { calculateRecipe } from './recipe-calculator';
import { createLogSnapshot } from './recipe-snapshot';
import { food, grams, lookup, recipe } from './testing/fixtures';

const carrot = food({ id: 'carrot', total_oxalate_mg_per_100g: '10.00', total_soluble_oxalate_mg_per_100g: '4.00' });
const foods = lookup(carrot);
const now = new Date('2026-11-16T12:00:00.000Z');

describe('createLogSnapshot', () => {
  const soup = recipe([grams('carrot', 400, 'Carrot')], 4); // 40 mg total, 10 per serving

  it('one serving', () => {
    const s = createLogSnapshot(soup, calculateRecipe(soup, foods, () => 'Low'), 1, now);
    expect(s).toEqual({
      recipeId: 'r1',
      recipeName: 'Test soup',
      multiplier: 1,
      mg: 10,
      solubleMg: 4,
      level: 'Low',
      incomplete: false,
      ingredients: [{ name: 'Carrot', grams: 100, mg: 10 }],
      dataUpdatedAt: FOOD_DATA_UPDATED_AT,
      loggedAt: '2026-11-16T12:00:00.000Z',
    });
  });

  it('½ and 2 servings scale mg and the ingredient portion', () => {
    const result = calculateRecipe(soup, foods);
    const half = createLogSnapshot(soup, result, 0.5, now);
    const two = createLogSnapshot(soup, result, 2, now);
    expect(half.mg).toBe(5);
    expect(half.ingredients[0]).toEqual({ name: 'Carrot', grams: 50, mg: 5 });
    expect(two.mg).toBe(20);
    expect(two.solubleMg).toBe(8);
    expect(two.ingredients[0].grams).toBe(200);
  });

  it('does not change after the recipe is edited', () => {
    const editable = recipe([grams('carrot', 400, 'Carrot')], 4);
    const snap = createLogSnapshot(editable, calculateRecipe(editable, foods), 1, now);

    editable.name = 'Renamed';
    editable.serves = 1;
    editable.ingredients[0].grams = 1000;
    editable.ingredients.push(grams('carrot', 500));

    expect(snap.recipeName).toBe('Test soup');
    expect(snap.mg).toBe(10);
    expect(snap.ingredients).toEqual([{ name: 'Carrot', grams: 100, mg: 10 }]);
    expect(Object.isFrozen(snap)).toBeTrue();
    expect(Object.isFrozen(snap.ingredients)).toBeTrue();
  });
});
