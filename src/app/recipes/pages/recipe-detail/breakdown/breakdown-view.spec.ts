import { calculateRecipe } from '../../../engine/recipe-calculator';
import { levelForMgPerServing } from '../../../engine/recipe-level';
import { custom, food, grams, lookup, recipe, servings } from '../../../engine/testing/fixtures';
import { breakdownRows } from './breakdown-view';

describe('breakdownRows', () => {
  const foods = lookup(
    food({ id: 'carrot', item: 'Carrot' }), // 10 mg / 100 g
    food({ id: 'spinach', item: 'Spinach', total_oxalate_mg_per_100g: '100.00' }),
    // No weight for a serving, but a measured mg per serving.
    food({ id: 'cup', item: 'Mystery greens', total_oxalate_mg_per_100g: 'n/a', serving_g: 'n/a', calc_oxalate_per_serving: '5.00' })
  );
  const rowsFor = (r: ReturnType<typeof recipe>) => breakdownRows(r, calculateRecipe(r, foods, levelForMgPerServing));

  it('keeps the engine order (highest first, unknown last) with mg, share and bar width', () => {
    const rows = rowsFor(
      recipe([grams('carrot', 200, 'Carrot'), custom('Tapioca starch', 10), grams('spinach', 50, 'Spinach')])
    );
    expect(rows.map((r) => r.name)).toEqual(['Spinach', 'Carrot', 'Tapioca starch']);
    expect(rows[0]).toEqual(
      jasmine.objectContaining({ amount: '50 g', known: true, mg: '50.0', share: '71%', ariaLabel: 'Spinach, 50 g, 50.0 mg, 71 percent of total' })
    );
    expect(rows[0].barWidth).toBeCloseTo(71.43, 1);
    expect(rows[1]).toEqual(jasmine.objectContaining({ amount: '200 g', mg: '20.0', share: '29%' }));
  });

  it('unknown rows: no mg, share "—", no bar, and say so to screen readers', () => {
    const [, unknown] = rowsFor(recipe([grams('carrot', 100, 'Carrot'), custom('Tapioca starch', 10)]));
    expect(unknown).toEqual(
      jasmine.objectContaining({ known: false, mg: '', share: '—', barWidth: 0, ariaLabel: 'Tapioca starch, 10 g, oxalate unknown' })
    );
  });

  it('a tiny share still gets a 1% bar', () => {
    const rows = rowsFor(recipe([grams('spinach', 100, 'Spinach'), grams('carrot', 1, 'Carrot')]));
    expect(rows[1].share).toBe('0%');
    expect(rows[1].barWidth).toBe(1);
  });

  it('shows the household amount when the weight is unknown', () => {
    const ingredient = { ...servings('cup', 2, 'Mystery greens'), servingLabel: '1/2 cup' };
    const [row] = rowsFor(recipe([ingredient]));
    expect(row.amount).toBe('2 × 1/2 cup');
    expect(row.mg).toBe('10.0');
  });
});
