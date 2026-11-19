import { FOOD_DATA_UPDATED_AT, Recipe, RecipeLogSnapshot, RecipeResult } from '../model/recipe';

/**
 * A frozen copy of what was eaten: `multiplier` servings of the recipe.
 * Ingredient grams and mg are scaled to that portion. Later edits to the
 * recipe never change it. `level` is the level of one recipe serving.
 */
export function createLogSnapshot(
  recipe: Pick<Recipe, 'id' | 'name' | 'serves'>,
  result: RecipeResult,
  multiplier: number,
  now: Date = new Date()
): RecipeLogSnapshot {
  const portion = multiplier / (recipe.serves >= 1 ? recipe.serves : 1);
  const snapshot: RecipeLogSnapshot = {
    recipeId: recipe.id,
    recipeName: recipe.name,
    multiplier,
    mg: result.perServingMg * multiplier,
    solubleMg: result.perServingSolubleMg * multiplier,
    level: result.level,
    incomplete: result.incomplete,
    solubleIncomplete: result.solubleIncomplete,
    ingredients: result.breakdown.map((b) =>
      Object.freeze({
        name: b.name,
        grams: b.grams === null ? null : b.grams * portion,
        mg: b.mg === null ? null : b.mg * portion,
      })
    ),
    dataUpdatedAt: FOOD_DATA_UPDATED_AT,
    loggedAt: now.toISOString(),
  };
  Object.freeze(snapshot.ingredients);
  return Object.freeze(snapshot);
}
