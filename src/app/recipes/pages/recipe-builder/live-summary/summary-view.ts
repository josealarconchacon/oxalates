import { RecipeResult } from '../../../model/recipe';
import { formatMg } from '../../../engine/format';

/** What the summary card and the bottom bar show, as text. */
export interface SummaryView {
  /** 'empty' = no ingredients; 'unknown' = none of them has a value. */
  state: 'loading' | 'empty' | 'unknown' | 'ready';
  perServing: string;
  wholeRecipe: string;
  solublePerServing: string;
  /** Totals are a minimum because some ingredient is unknown. */
  atLeast: boolean;
  solubleAtLeast: boolean;
  level: string | null;
  unknownNames: string[];
}

export function summaryView(result: RecipeResult, ingredientCount: number, ready: boolean): SummaryView {
  const state = !ready ? 'loading' : ingredientCount === 0 ? 'empty' : result.allUnknown ? 'unknown' : 'ready';
  return {
    state,
    perServing: formatMg(result.perServingMg),
    wholeRecipe: formatMg(result.totalMg),
    solublePerServing: formatMg(result.perServingSolubleMg),
    atLeast: result.incomplete,
    solubleAtLeast: result.solubleIncomplete,
    level: result.level,
    unknownNames: result.unknownIngredients.map((u) => u.name),
  };
}
