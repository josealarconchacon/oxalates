import { RecipeLogSnapshot } from 'src/app/recipes/model/recipe';
import { DailyFoodEntry, DayItem, isRecipeEntry } from '../service/food-entry.service';

/** mg for some entries. `atLeast`: an incomplete recipe is in there, so the real total is higher. */
export interface Totals {
  mg: number;
  solubleMg: number;
  atLeast: boolean;
  solubleAtLeast: boolean;
}

const ZERO: Totals = { mg: 0, solubleMg: 0, atLeast: false, solubleAtLeast: false };

/**
 * One entry. Foods: exactly the old formula. Recipes: the saved snapshot,
 * never the live recipe. Unknown is never 0: an all-unknown recipe has
 * mg 0 but is incomplete, so the total reads "at least".
 */
export function itemTotals(item: DayItem): Totals {
  if (isRecipeEntry(item)) return snapshotTotals(item.snapshot);
  return {
    mg: (item.oxalatePerServing || 0) * (item.numberOfServings || 0),
    solubleMg: (item.solubleOxalatePerServing || 0) * (item.numberOfServings || 0),
    atLeast: false,
    solubleAtLeast: false,
  };
}

/** A logged recipe's numbers, straight from its snapshot. */
export function snapshotTotals(s: RecipeLogSnapshot): Totals {
  return {
    mg: s.mg,
    solubleMg: s.solubleMg,
    atLeast: s.incomplete,
    solubleAtLeast: s.incomplete || !!s.solubleIncomplete,
  };
}

export function sumTotals(list: Totals[]): Totals {
  return list.reduce(
    (sum, t) => ({
      mg: sum.mg + t.mg,
      solubleMg: sum.solubleMg + t.solubleMg,
      atLeast: sum.atLeast || t.atLeast,
      solubleAtLeast: sum.solubleAtLeast || t.solubleAtLeast,
    }),
    ZERO
  );
}

export function mealTotals(items: DayItem[] | undefined): Totals {
  return sumTotals((items ?? []).map(itemTotals));
}

export function dayTotals(entry: Pick<DailyFoodEntry, 'breakfast' | 'lunch' | 'dinner' | 'snacks'>): Totals {
  return sumTotals([entry.breakfast, entry.lunch, entry.dinner, entry.snacks].map(mealTotals));
}

/** The local calendar date, "yyyy-mm-dd": the key Daily Intake reads for the date it shows. */
export function localDayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
