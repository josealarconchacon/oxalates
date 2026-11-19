import { formatDate } from '@angular/common';
import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/landing-page/dialog-service/oxalate/service/notification.service';
import {
  FoodEntryService,
  MealKey,
  RecipeEntry,
} from 'src/app/user-auth/profile/food-entry/service/food-entry.service';
import { createLogSnapshot } from '../engine/recipe-snapshot';
import { Recipe, RecipeLogSnapshot, RecipeResult } from '../model/recipe';
import { LoggedToastComponent, LoggedToastData } from '../pages/recipe-detail/log-serving/logged-toast.component';

const MEAL_LABELS: Record<MealKey, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

/** How long a save may take before we say it failed (same as the builder). */
export const LOG_TIMEOUT_MS = 15_000;

/** One logged serving: where it went and the exact entry, so Undo can remove it. */
export interface LoggedServing {
  dayKey: string;
  meal: MealKey;
  entry: RecipeEntry;
}

/**
 * The Daily Intake entry for a snapshot. The food-style fields are copied
 * once from the snapshot, so code that only knows foods shows the right mg.
 */
export function recipeEntryFor(snapshot: RecipeLogSnapshot, entryId: string): RecipeEntry {
  return {
    kind: 'recipe',
    entryId,
    // A plain copy: the engine freezes snapshots, and Firestore wants plain objects.
    snapshot: { ...snapshot, ingredients: snapshot.ingredients.map((i) => ({ ...i })) },
    foodName: snapshot.recipeName,
    servingSize: 'recipe',
    numberOfServings: snapshot.multiplier,
    oxalatePerServing: snapshot.mg / snapshot.multiplier,
    solubleOxalatePerServing: snapshot.solubleMg / snapshot.multiplier,
  };
}

/** Logs recipe servings into Daily Intake as frozen snapshots, and undoes them. */
@Injectable({ providedIn: 'root' })
export class RecipeLogService {
  private entries = inject(FoodEntryService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private notifications = inject(NotificationService);
  private locale = inject(LOCALE_ID);

  async log(
    recipe: Recipe,
    result: RecipeResult,
    choice: { dayKey: string; meal: MealKey; multiplier: number }
  ): Promise<LoggedServing> {
    const snapshot = createLogSnapshot(recipe, result, choice.multiplier);
    const entry = recipeEntryFor(snapshot, newEntryId());
    await withTimeout(this.entries.addToMeal(choice.dayKey, choice.meal, entry), LOG_TIMEOUT_MS);
    return { dayKey: choice.dayKey, meal: choice.meal, entry };
  }

  /** "Added to Dinner on Thu, Nov 19." with View day and Undo. */
  announce(logged: LoggedServing): void {
    const meal = MEAL_LABELS[logged.meal];
    const [y, m, d] = logged.dayKey.split('-').map(Number);
    const day = formatDate(new Date(y, m - 1, d), 'EEE, MMM d', this.locale);
    const data: LoggedToastData = {
      message: `Added to ${meal} on ${day}.`,
      viewDay: () => void this.router.navigate(['/food-entry'], { queryParams: { date: logged.dayKey } }),
      undo: async () => {
        try {
          await this.undo(logged);
          this.notifications.show(`Removed from ${meal}.`, 'Close', ['success-snackbar']);
        } catch {
          this.notifications.show(
            "We couldn't undo this. You can remove it in Calculate Daily Intake.",
            'Close',
            ['error-snackbar']
          );
        }
      },
    };
    this.snackBar.openFromComponent(LoggedToastComponent, {
      data,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  undo(logged: LoggedServing): Promise<void> {
    return withTimeout(
      this.entries.removeRecipeEntry(logged.dayKey, logged.meal, logged.entry.entryId),
      LOG_TIMEOUT_MS
    );
  }
}

function newEntryId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => (clearTimeout(timer), resolve(value)),
      (error) => (clearTimeout(timer), reject(error))
    );
  });
}
