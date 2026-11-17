import { calculateRecipe } from './recipe-calculator';
import { custom, food, grams, lookup, recipe, servings } from './testing/fixtures';

// Three foods with easy numbers (mg per 100 g / soluble per 100 g).
const spinach = food({ id: 'spinach', item: 'Spinach', total_oxalate_mg_per_100g: '970.00', total_soluble_oxalate_mg_per_100g: '400.00' });
const carrot = food({ id: 'carrot', item: 'Carrot', total_oxalate_mg_per_100g: '10.00', total_soluble_oxalate_mg_per_100g: '4.00' });
const rice = food({ id: 'rice', item: 'Rice', total_oxalate_mg_per_100g: '2.00', total_soluble_oxalate_mg_per_100g: null, calc_soluble_mg_oxalate_per_serving: '0.00' });
const mystery = food({ id: 'mystery', item: 'Mystery', calc_level: 'uncalculated', total_oxalate_mg_per_100g: 'uncalculated', calc_oxalate_per_serving: '0.00', serving_g: null });
const foods = lookup(spinach, carrot, rice, mystery);

describe('calculateRecipe', () => {
  it('known foods only: mg = mg per 100 g × grams ÷ 100, summed', () => {
    const r = calculateRecipe(recipe([grams('spinach', 50), grams('carrot', 200)]), foods);
    expect(r.totalMg).toBeCloseTo(485 + 20, 10);
    expect(r.perServingMg).toBeCloseTo(505, 10);
    expect(r.totalSolubleMg).toBeCloseTo(200 + 8, 10);
    expect(r.incomplete).toBeFalse();
    expect(r.allUnknown).toBeFalse();
    expect(r.unknownIngredients).toEqual([]);
  });

  it('one unknown ingredient: total is "at least" the known part', () => {
    const r = calculateRecipe(recipe([grams('carrot', 100), grams('mystery', 30, 'Mystery')]), foods);
    expect(r.totalMg).toBe(10);
    expect(r.incomplete).toBeTrue();
    expect(r.unknownIngredients.map((u) => u.name)).toEqual(['Mystery']);
    expect(r.allUnknown).toBeFalse();
  });

  it('a food missing from the list is unknown, not 0', () => {
    const r = calculateRecipe(recipe([grams('gone', 100, 'Removed food')]), foods);
    expect(r.breakdown[0].mg).toBeNull();
    expect(r.allUnknown).toBeTrue();
  });

  it('all unknown: no level and every row unknown', () => {
    const r = calculateRecipe(recipe([grams('mystery', 30), custom('Tapioca starch', 20)]), foods, () => 'Low');
    expect(r.allUnknown).toBeTrue();
    expect(r.totalMg).toBe(0);
    expect(r.level).toBeNull();
  });

  it('soluble missing on some rows: soluble is incomplete, total is not', () => {
    const r = calculateRecipe(recipe([grams('carrot', 100), grams('rice', 100)]), foods);
    expect(r.incomplete).toBeFalse();
    expect(r.solubleIncomplete).toBeTrue();
    expect(r.totalSolubleMg).toBe(4); // carrot only; rice's "0.00" is a placeholder
  });

  it('derived per 100 g (no per-100 g value) is used and flagged', () => {
    const derivedFood = food({ id: 'd', total_oxalate_mg_per_100g: null as any, calc_oxalate_per_serving: '6.00', serving_g: '30.00' });
    const r = calculateRecipe(recipe([grams('d', 60)]), lookup(derivedFood));
    expect(r.totalMg).toBeCloseTo(12, 10); // 6 / 30 × 100 = 20 per 100 g → 12 mg in 60 g
    expect(r.breakdown[0].derived).toBeTrue();
  });

  it('household measure with grams uses the measured mg per serving × count', () => {
    // Per 100 g (dry leaves) would give 109 mg; the measured cup is 10.9 mg.
    const tea = food({ id: 'tea', total_oxalate_mg_per_100g: '45.50', serving_size: '1 cup', serving_g: '240.00', calc_oxalate_per_serving: '10.90' });
    const r = calculateRecipe(recipe([servings('tea', 2)]), lookup(tea));
    expect(r.totalMg).toBeCloseTo(21.8, 10);
    expect(r.breakdown[0].grams).toBe(480);
  });

  it('household measure without grams: mg = mg per serving × count, grams null', () => {
    const scoop = food({ id: 's', total_oxalate_mg_per_100g: null as any, serving_size: '2 scoops', serving_g: null, calc_oxalate_per_serving: '52.53' });
    const r = calculateRecipe(recipe([servings('s', 0.5)]), lookup(scoop));
    expect(r.totalMg).toBeCloseTo(26.265, 10);
    expect(r.breakdown[0].grams).toBeNull();
    expect(r.breakdown[0].known).toBeTrue();
  });

  it('household measure of an "uncalculated" food falls back to per 100 g × serving grams', () => {
    const u = food({ id: 'u', calc_level: 'uncalculated', total_oxalate_mg_per_100g: '20.00', calc_oxalate_per_serving: '0.00', serving_g: '50.00' });
    const r = calculateRecipe(recipe([servings('u', 1)]), lookup(u));
    expect(r.totalMg).toBeCloseTo(10, 10);
  });

  it('custom ingredient without a value is unknown', () => {
    const r = calculateRecipe(recipe([custom('Tapioca starch', 30)]), foods);
    expect(r.incomplete).toBeTrue();
    expect(r.includesYourValues).toBeFalse();
  });

  it('custom ingredient with "Your value" is counted and flagged', () => {
    const r = calculateRecipe(recipe([custom('Tapioca starch', 30, 10), grams('carrot', 100)]), foods);
    expect(r.totalMg).toBeCloseTo(3 + 10, 10);
    expect(r.incomplete).toBeFalse();
    expect(r.includesYourValues).toBeTrue();
    expect(r.solubleIncomplete).toBeTrue(); // no soluble for your own value
    expect(r.breakdown.find((b) => b.name === 'Tapioca starch')!.isYourValue).toBeTrue();
  });

  it('per serving follows "serves"', () => {
    const two = calculateRecipe(recipe([grams('carrot', 200)], 2), foods);
    const four = calculateRecipe(recipe([grams('carrot', 200)], 4), foods);
    expect(two.totalMg).toBe(four.totalMg);
    expect(two.perServingMg).toBeCloseTo(10, 10);
    expect(four.perServingMg).toBeCloseTo(5, 10);
    expect(four.perServingSolubleMg).toBeCloseTo(2, 10);
  });

  it('breakdown: highest mg first, unknown last, shares of the known total add up to 100', () => {
    const r = calculateRecipe(
      recipe([grams('carrot', 100, 'Carrot'), grams('mystery', 10, 'Mystery'), grams('spinach', 10, 'Spinach'), grams('rice', 300, 'Rice')]),
      foods
    );
    expect(r.breakdown.map((b) => b.name)).toEqual(['Spinach', 'Carrot', 'Rice', 'Mystery']);
    const shares = r.breakdown.filter((b) => b.known).map((b) => b.sharePercent!);
    expect(shares.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 10);
    expect(r.breakdown[3].sharePercent).toBeNull();
  });

  it('does not round inside the math', () => {
    const r = calculateRecipe(recipe([grams('carrot', 33.333)], 3), foods);
    expect(r.perServingMg).toBe((10 * 33.333) / 100 / 3);
  });

  it('passes per-serving mg to the level function, if one is given', () => {
    const levelOf = jasmine.createSpy('levelOf').and.returnValue('Medium');
    const r = calculateRecipe(recipe([grams('carrot', 200)], 2), foods, levelOf);
    expect(levelOf).toHaveBeenCalledWith(10);
    expect(r.level).toBe('Medium');
    expect(calculateRecipe(recipe([grams('carrot', 200)]), foods).level).toBeNull();
  });
});
