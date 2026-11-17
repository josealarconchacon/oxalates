import { calculateRecipe } from './recipe-calculator';
import { toFoodRecord } from './food-record';
import { levelForMgPerServing } from './recipe-level';
import { custom, food, grams, lookup, recipe, servings } from './testing/fixtures';

const carrot = food({ id: 'carrot', total_oxalate_mg_per_100g: '10.00', total_soluble_oxalate_mg_per_100g: '4.00' });
// A measure with no weight and no soluble data.
const scoop = food({
  id: 'scoop',
  total_oxalate_mg_per_100g: null as any,
  serving_size: '1 scoop',
  serving_g: null,
  calc_oxalate_per_serving: '8.00',
  total_soluble_oxalate_mg_per_100g: null,
  calc_soluble_mg_oxalate_per_serving: '0.00',
});
const foods = lookup(carrot, scoop);
const record = (r: ReturnType<typeof recipe>) =>
  toFoodRecord(r, calculateRecipe(r, foods, levelForMgPerServing));

describe('toFoodRecord', () => {
  it('a complete recipe looks like a food in the list', () => {
    // 300 g carrot = 30 mg; ÷ 4 = 7.5 mg per serving → Medium.
    const soup = { ...recipe([grams('carrot', 300, 'Carrot')], 4), name: 'Carrot soup', notes: 'Simmer.' };
    expect(record(soup)).toEqual({
      category: 'Recipe',
      calc_level: 'Medium',
      level: '3',
      item: 'Carrot soup',
      total_oxalate_mg_per_100g: '10.00',
      total_soluble_oxalate_mg_per_100g: '4.00',
      serving_size: '1 serving (of 4)',
      serving_g: '75.00',
      calc_oxalate_per_serving: '7.50',
      calc_soluble_mg_oxalate_per_serving: '3.00',
      soluble_oxalate: '',
      reference: 'Your recipe',
      notes: 'Simmer.',
      id: 'r1',
    });
  });

  it('has the same keys, in the same order, as an entry in the food list', () => {
    expect(Object.keys(record(recipe([grams('carrot', 100)])))).toEqual([
      'category', 'calc_level', 'level', 'item', 'total_oxalate_mg_per_100g',
      'total_soluble_oxalate_mg_per_100g', 'serving_size', 'serving_g',
      'calc_oxalate_per_serving', 'calc_soluble_mg_oxalate_per_serving',
      'soluble_oxalate', 'reference', 'notes', 'id',
    ]);
  });

  it('an ingredient with no weight: per 100 g "uncalculated", serving_g null', () => {
    const r = record(recipe([grams('carrot', 100), servings('scoop', 1)], 2));
    expect(r.calc_oxalate_per_serving).toBe('9.00'); // (10 + 8) ÷ 2
    expect(r.total_oxalate_mg_per_100g).toBe('uncalculated');
    expect(r.serving_g).toBeNull();
    expect(r.calc_level).toBe('Medium');
  });

  it('no soluble data at all: soluble per serving "uncalculated", per 100 g null', () => {
    const r = record(recipe([servings('scoop', 1)]));
    expect(r.calc_soluble_mg_oxalate_per_serving).toBe('uncalculated');
    expect(r.total_soluble_oxalate_mg_per_100g).toBeNull();
  });

  it('incomplete: keeps the level of the known part and says so in notes', () => {
    const r = record({ ...recipe([grams('carrot', 100), custom('Tapioca starch', 30)]), notes: 'Mix.' });
    expect(r.calc_level).toBe('Medium'); // 10 mg, 1 serving
    expect(r.notes).toBe('Incomplete: no oxalate value for Tapioca starch. Mix.');
  });

  it('every ingredient unknown → "uncalculated" / "7"', () => {
    const r = record(recipe([custom('Tapioca starch', 30)]));
    expect(r.calc_level).toBe('uncalculated');
    expect(r.level).toBe('7');
    expect(r.calc_oxalate_per_serving).toBe('uncalculated');
    expect(r.total_oxalate_mg_per_100g).toBe('uncalculated');
  });

  it('no ingredients → "uncalculated" / "7"', () => {
    const r = record(recipe([]));
    expect(r.calc_level).toBe('uncalculated');
    expect(r.level).toBe('7');
  });
});
