import { Recipe } from '../model/recipe';

export const MAX_INGREDIENT_GRAMS = 10_000;
/** For household measures without a weight, e.g. "2 scoops". */
export const MAX_SERVING_COUNT = 100;

export interface RecipeError {
  /** 'name' | 'serves' | 'ingredients' | an ingredient id */
  field: string;
  message: string;
}

/** Everything that stops a recipe being saved; empty when it's fine. */
export function validateRecipe(
  recipe: Pick<Recipe, 'name' | 'ingredients'> & { serves: number | null }
): RecipeError[] {
  const errors: RecipeError[] = [];
  if (!recipe.name?.trim()) {
    errors.push({ field: 'name', message: 'Give your recipe a name.' });
  }
  if (recipe.serves === null || !Number.isInteger(recipe.serves) || recipe.serves < 1) {
    errors.push({ field: 'serves', message: 'Serves must be 1 or more.' });
  }
  if (!recipe.ingredients?.length) {
    errors.push({ field: 'ingredients', message: 'Add at least one ingredient.' });
  }

  for (const i of recipe.ingredients ?? []) {
    const fail = (message: string) => errors.push({ field: i.id, message });
    if (!i.name?.trim()) fail('Ingredient needs a name.');
    if (i.source === 'database' && !i.foodId) fail(`Pick "${i.name}" from the food list again.`);
    if (!(i.inputAmount > 0)) {
      fail('Enter an amount above 0.');
    } else if (i.inputUnit === 'serving' && i.inputAmount > MAX_SERVING_COUNT) {
      fail(`Use ${MAX_SERVING_COUNT} servings or fewer.`);
    } else if (i.inputUnit === 'g' && !(i.grams !== null && i.grams > 0)) {
      fail('Enter an amount above 0.');
    } else if (i.grams !== null && i.grams > MAX_INGREDIENT_GRAMS) {
      fail(`Use ${MAX_INGREDIENT_GRAMS.toLocaleString('en-US')} g or less.`);
    }
    const yours = i.customMgPer100g;
    if (yours !== undefined && !(Number.isFinite(yours) && yours >= 0)) {
      fail('Your value must be 0 or more mg per 100 g.');
    }
  }
  return errors;
}
