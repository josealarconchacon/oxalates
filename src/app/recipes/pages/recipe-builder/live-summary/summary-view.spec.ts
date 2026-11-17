import { calculateRecipe } from '../../../engine/recipe-calculator';
import { custom, food, grams, lookup, recipe } from '../../../engine/testing/fixtures';
import { summaryView } from './summary-view';

const foods = lookup(food({ id: 'carrot', total_oxalate_mg_per_100g: '10.00' }));
const view = (ingredients: any[], ready = true) =>
  summaryView(calculateRecipe(recipe(ingredients, 2), foods), ingredients.length, ready);

describe('summaryView', () => {
  it('loading until the food list is ready', () => {
    expect(view([grams('carrot', 100)], false).state).toBe('loading');
  });

  it('empty with no ingredients', () => {
    expect(view([]).state).toBe('empty');
  });

  it('unknown when no ingredient has a value', () => {
    const v = view([custom('Tapioca', 20)]);
    expect(v.state).toBe('unknown');
    expect(v.unknownNames).toEqual(['Tapioca']);
  });

  it('ready: rounded for display, with "at least" when incomplete', () => {
    const v = view([grams('carrot', 101), custom('Tapioca', 20)]);
    expect(v.state).toBe('ready');
    expect(v.perServing).toBe('5.1'); // 10.1 ÷ 2 = 5.05
    expect(v.wholeRecipe).toBe('10.1');
    expect(v.atLeast).toBeTrue();
  });
});
