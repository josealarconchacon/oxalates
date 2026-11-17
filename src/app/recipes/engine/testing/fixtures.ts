// Test data for the recipe engine specs. Not used by the app.
import { Oxalate } from 'src/app/landing-page/model/oxalate';

/** A food with every field set; override what a test needs. */
export function food(overrides: Partial<Oxalate> = {}): Oxalate {
  return {
    id: '1',
    category: 'Vegetables',
    calc_level: 'Low',
    level: '2',
    item: 'Carrot',
    total_oxalate_mg_per_100g: '10.00',
    total_soluble_oxalate_mg_per_100g: '4.00',
    serving_size: '1/2 cup',
    serving_g: '50.00',
    calc_oxalate_per_serving: '5.00',
    calc_soluble_mg_oxalate_per_serving: '2.00',
    soluble_oxalate: '0',
    reference: 'Test',
    notes: '',
    iconUrl: '',
    savedAt: '',
    ...overrides,
  };
}
