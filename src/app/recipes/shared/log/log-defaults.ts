import { MealKey } from 'src/app/user-auth/profile/food-entry/service/food-entry.service';

/**
 * Which meal "Log a serving" picks first, by local time. Change these to move
 * the cut-offs: before 11:00 Breakfast, 11:00–15:59 Lunch, from 16:00 Dinner.
 * (Snacks is never the default.)
 */
export const LUNCH_FROM_HOUR = 11;
export const DINNER_FROM_HOUR = 16;

export function defaultMeal(now: Date = new Date()): MealKey {
  const hour = now.getHours();
  if (hour < LUNCH_FROM_HOUR) return 'breakfast';
  if (hour < DINNER_FROM_HOUR) return 'lunch';
  return 'dinner';
}

/** Custom servings: steps and limits. */
export const SERVINGS_STEP = 0.25;
export const SERVINGS_MIN = 0.25;
export const SERVINGS_MAX = 20;
export const SERVINGS_RANGE_MESSAGE = 'Choose between 0.25 and 20 servings.';
