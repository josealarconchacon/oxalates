import { validateRecipe } from './recipe-validation';
import { custom, grams, recipe, servings } from './testing/fixtures';

const messages = (r: Parameters<typeof validateRecipe>[0]) => validateRecipe(r).map((e) => e.message);

describe('validateRecipe', () => {
  it('a good recipe has no errors', () => {
    expect(validateRecipe(recipe([grams('carrot', 100)], 2))).toEqual([]);
  });

  it('needs a name, servings ≥ 1 (whole number) and an ingredient', () => {
    const r = { ...recipe([], 0), name: '  ' };
    expect(messages(r)).toEqual([
      'Give your recipe a name.',
      'Servings must be a whole number, 1 or more.',
      'Add at least one ingredient.',
    ]);
    expect(messages(recipe([grams('carrot', 100)], 1.5))).toContain('Servings must be a whole number, 1 or more.');
  });

  it('each amount must be > 0 and ≤ 10,000 g', () => {
    expect(messages(recipe([grams('carrot', 0, 'Carrot')]))).toEqual(['Enter an amount for Carrot.']); // one message per problem
    expect(messages(recipe([grams('carrot', 10_000)]))).toEqual([]);
    expect(messages(recipe([grams('carrot', 10_001)]))).toEqual(['Use 10,000 g or less.']);
  });

  it('household servings: > 0 and at most 100', () => {
    expect(messages(recipe([servings('tea', 100)]))).toEqual([]);
    expect(messages(recipe([servings('tea', 101)]))).toEqual(['Use 100 servings or fewer.']);
  });

  it('flags the ingredient by id', () => {
    const bad = grams('carrot', -5, 'Carrot');
    expect(validateRecipe(recipe([bad]))[0].field).toBe(bad.id);
  });

  it('custom ingredients need a name; "Your value" must be 0 or more', () => {
    expect(messages(recipe([custom(' ', 10)]))).toContain('Ingredient needs a name.');
    expect(messages(recipe([custom('Tapioca', 10, -1)]))).toEqual(['Your value must be 0 or more mg per 100 g.']);
    expect(messages(recipe([custom('Tapioca', 10, 0)]))).toEqual([]);
  });

  it('a database ingredient needs its food id', () => {
    const lost = { ...grams('x', 10, 'Kale'), foodId: undefined };
    expect(messages(recipe([lost]))).toEqual(['Pick "Kale" from the food list again.']);
  });
});
