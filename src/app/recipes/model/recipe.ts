/**
 * Recipes: a user's own dish built from foods in the oxalate list or ingredients that aren't in it
 */

export const FOOD_DATA_UPDATED_AT = '2024-07-27';

/** 'serving' = the food's own household measure, e.g. 2 × "1/2 cup". */
export type IngredientInputUnit = 'g' | 'serving';

export interface RecipeIngredient {
  id: string;
  source: 'database' | 'custom';
  /** The food's id in the oxalate list (database ingredients only). */
  foodId?: string;
  name: string;
  /** Null when the amount is a household measure with no known weight. */
  grams: number | null;
  /** What the user typed, so the UI can show it back. */
  inputAmount: number;
  inputUnit: IngredientInputUnit;
  /** The household measure, e.g. "1/2 cup" (when inputUnit is 'serving'). */
  servingLabel?: string;
  /** Custom ingredients only: the user's own mg per 100 g ("Your value"). */
  customMgPer100g?: number;
}

export interface Recipe {
  id: string;
  ownerId: string;
  name: string;
  /** How many servings the recipe makes (integer ≥ 1). */
  serves: number;
  ingredients: RecipeIngredient[];
  notes: string;
  tags: string[];
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** One ingredient's share of the recipe. mg/share are null when unknown. */
export interface IngredientBreakdown {
  ingredientId: string;
  name: string;
  grams: number | null;
  mg: number | null;
  solubleMg: number | null;
  /** Share of the KNOWN total, 0–100; null when this row is unknown. */
  sharePercent: number | null;
  known: boolean;
  /** Counted from the user's own number ("Your value"). */
  isYourValue: boolean;
  /** mg per 100 g was worked out from mg per serving ÷ serving grams. */
  derived: boolean;
}

export interface RecipeResult {
  /** Sum of the known ingredients ("at least" when incomplete). */
  totalMg: number;
  perServingMg: number;
  totalSolubleMg: number;
  perServingSolubleMg: number;
  /** Level of perServingMg; null until level ranges are set, or when all unknown. */
  level: string | null;
  incomplete: boolean;
  unknownIngredients: { id: string; name: string }[];
  includesYourValues: boolean;
  /** Some ingredient's soluble value is unknown (soluble total is "at least"). */
  solubleIncomplete: boolean;
  allUnknown: boolean;
  /** Highest mg first; unknown rows last. */
  breakdown: IngredientBreakdown[];
}

/** A frozen copy of a recipe serving, saved into Daily Intake (PR 4). */
export interface RecipeLogSnapshot {
  recipeId: string;
  recipeName: string;
  /** Servings eaten, e.g. 0.5, 1, 2. */
  multiplier: number;
  mg: number;
  solubleMg: number;
  level: string | null;
  incomplete: boolean;
  /** Some ingredient's soluble value is unknown (soluble is "at least"). */
  solubleIncomplete: boolean;
  ingredients: { name: string; grams: number | null; mg: number | null }[];
  dataUpdatedAt: string;
  loggedAt: string;
}
