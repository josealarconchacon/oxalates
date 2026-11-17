import { describeAmount, formatGrams, unitOptions } from './units';
import { custom, food, grams, servings } from './testing/fixtures';

describe('unitOptions', () => {
  it('offers g plus the household measure with its weight', () => {
    expect(unitOptions(food({ serving_size: '1 cup', serving_g: '195.00' })).map((o) => o.label)).toEqual([
      'g',
      '1 cup (195 g)',
    ]);
  });

  it('a measure with no weight is offered when mg per serving is known', () => {
    const scoop = food({ serving_size: '2 scoops', serving_g: null, calc_oxalate_per_serving: '52.53' });
    expect(unitOptions(scoop)[1]).toEqual({ unit: 'serving', label: '2 scoops', servingLabel: '2 scoops', servingGrams: null });
  });

  it('only g when the measure cannot be turned into mg', () => {
    const noData = food({
      calc_level: 'uncalculated',
      calc_oxalate_per_serving: '0.00',
      total_oxalate_mg_per_100g: '12.00',
      serving_g: null,
    });
    expect(unitOptions(noData).map((o) => o.unit)).toEqual(['g']);
    expect(unitOptions(food({ serving_size: 'unk' })).map((o) => o.unit)).toEqual(['g']);
    expect(unitOptions(undefined).map((o) => o.unit)).toEqual(['g']);
  });
});

describe('describeAmount', () => {
  it('grams', () => {
    expect(describeAmount(grams('x', 120), null)).toBe('120 g');
  });

  it('household measure with and without a weight', () => {
    const cup = { ...servings('x', 2), servingLabel: '1 cup' };
    expect(describeAmount(cup, 195)).toBe('2 × 1 cup (195 g) · 390 g');
    expect(describeAmount({ ...servings('x', 0.5), servingLabel: '2 scoops' }, null)).toBe('0.5 × 2 scoops');
  });

  it('custom ingredients are grams', () => {
    expect(describeAmount(custom('Tapioca', 30), null)).toBe('30 g');
  });

  it('formats grams without trailing zeros', () => {
    expect(formatGrams(195)).toBe('195');
    expect(formatGrams(13.5)).toBe('13.5');
    expect(formatGrams(13.54)).toBe('13.5');
  });
});
