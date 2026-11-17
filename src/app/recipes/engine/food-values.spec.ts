import { foodValues, parseAmount } from './food-values';
import { food } from './testing/fixtures';

describe('parseAmount', () => {
  it('reads numbers', () => {
    expect(parseAmount('12.50')).toBe(12.5);
    expect(parseAmount(' 0.00 ')).toBe(0);
    expect(parseAmount(7)).toBe(7);
  });

  it('reads "Neg" (negligible) as 0', () => {
    expect(parseAmount('Neg')).toBe(0);
  });

  it('never turns missing values into 0', () => {
    for (const raw of ['uncalculated', 'n/a', '-', 'unc', 'unk', '', null, undefined, '-3']) {
      expect(parseAmount(raw as any)).withContext(String(raw)).toBeNull();
    }
  });
});

describe('foodValues', () => {
  it('reads a complete food', () => {
    expect(foodValues(food())).toEqual({
      mgPer100g: 10,
      solublePer100g: 4,
      mgPerServing: 5,
      solublePerServing: 2,
      servingGrams: 50,
      servingLabel: '1/2 cup',
      derived: false,
      solubleDerived: false,
    });
  });

  it('derives mg per 100 g from mg per serving ÷ serving grams, and flags it', () => {
    const v = foodValues(food({ total_oxalate_mg_per_100g: 'uncalculated' }));
    expect(v.mgPer100g).toBe(10); // 5 mg / 50 g × 100
    expect(v.derived).toBeTrue();
  });

  it('cannot derive without a serving weight', () => {
    const v = foodValues(food({ total_oxalate_mg_per_100g: null as any, serving_g: null }));
    expect(v.mgPer100g).toBeNull();
    expect(v.mgPerServing).toBe(5);
    expect(v.servingGrams).toBeNull();
  });

  it('ignores the placeholder per-serving values of "uncalculated" foods', () => {
    const v = foodValues(
      food({ calc_level: 'uncalculated', calc_oxalate_per_serving: '0.00', total_oxalate_mg_per_100g: '122.13' })
    );
    expect(v.mgPerServing).toBeNull();
    expect(v.mgPer100g).toBe(122.13); // the per-100 g value is still real
  });

  it('treats a soluble "0.00" per serving as unknown when there is no soluble per 100 g', () => {
    const v = foodValues(
      food({ total_soluble_oxalate_mg_per_100g: null, calc_soluble_mg_oxalate_per_serving: '0.00' })
    );
    expect(v.solublePerServing).toBeNull();
    expect(v.solublePer100g).toBeNull();
  });

  it('keeps a real total of 0 (e.g. salt)', () => {
    const v = foodValues(food({ total_oxalate_mg_per_100g: '0.00', calc_oxalate_per_serving: '0.00' }));
    expect(v.mgPer100g).toBe(0);
  });

  it('drops an "unk" serving size and a zero weight', () => {
    const v = foodValues(food({ serving_size: 'unk', serving_g: '0' }));
    expect(v.servingLabel).toBeNull();
    expect(v.servingGrams).toBeNull();
  });
});
