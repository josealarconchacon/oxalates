// Test data for the recipe engine specs. Not used by the app.
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { Recipe, RecipeIngredient } from '../../model/recipe';

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

let nextId = 0;

/** A database ingredient measured in grams. */
export function grams(foodId: string, g: number, name = 'Food ' + foodId): RecipeIngredient {
  return { id: 'i' + nextId++, source: 'database', foodId, name, grams: g, inputAmount: g, inputUnit: 'g' };
}

/** A database ingredient measured in the food's household servings. */
export function servings(foodId: string, count: number, name = 'Food ' + foodId): RecipeIngredient {
  return { id: 'i' + nextId++, source: 'database', foodId, name, grams: null, inputAmount: count, inputUnit: 'serving' };
}

/** An ingredient that isn't in the food list. */
export function custom(name: string, g: number, mgPer100g?: number): RecipeIngredient {
  return { id: 'i' + nextId++, source: 'custom', name, grams: g, inputAmount: g, inputUnit: 'g', customMgPer100g: mgPer100g };
}

export function recipe(ingredients: RecipeIngredient[], serves = 1): Recipe {
  return {
    id: 'r1',
    ownerId: 'u1',
    name: 'Test soup',
    serves,
    ingredients,
    notes: '',
    tags: [],
    createdAt: '2026-11-16T10:00:00.000Z',
    updatedAt: '2026-11-16T10:00:00.000Z',
  };
}

/** A lookup over the given foods, keyed by id. */
export function lookup(...foods: Oxalate[]) {
  const byId = new Map(foods.map((f) => [f.id, f]));
  return (id: string) => byId.get(id);
}
