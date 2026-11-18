import {
  EnvironmentInjector,
  Injectable,
  runInInjectionContext,
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { RecipeLogSnapshot } from 'src/app/recipes/model/recipe';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';

/** A food from the food list. Old entries have no `kind`: that means 'food'. */
export interface FoodItem {
  kind?: 'food';
  foodName: string;
  oxalatePerServing: number;
  solubleOxalatePerServing: number;
  servingSize: string;
  numberOfServings: number;
}

/**
 * A logged recipe: a frozen snapshot, never recomputed from the live recipe.
 * The food-style fields are copied from the snapshot once, so code that only
 * knows foods (like the live site) still shows the right name and mg.
 */
export interface RecipeEntry {
  kind: 'recipe';
  /** Unique per log; Undo removes exactly this entry. */
  entryId: string;
  snapshot: RecipeLogSnapshot;
  foodName: string;
  servingSize: string;
  numberOfServings: number;
  oxalatePerServing: number;
  solubleOxalatePerServing: number;
}

export type DayItem = FoodItem | RecipeEntry;

export type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface DailyFoodEntry {
  date: string;
  breakfast: DayItem[];
  lunch: DayItem[];
  dinner: DayItem[];
  snacks: DayItem[];
}

export function isRecipeEntry(item: DayItem): item is RecipeEntry {
  return item.kind === 'recipe';
}

@Injectable({
  providedIn: 'root',
})
export class FoodEntryService {
  private readonly collectionName = 'foodEntries';

  // AngularFire 19's compat classes call inject() when they are created, which only
  // works inside an injection context. A method call is not one, so every
  // Firestore reference below is built inside runInInjectionContext.

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private injector: EnvironmentInjector
  ) {}


  private async getCurrentUser(): Promise<string> {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.uid;
  }

  getDailyEntry(date: Date): Observable<DailyFoodEntry | null> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('No user found'));
        }

        const dateString = date.toISOString().split('T')[0];
        return runInInjectionContext(this.injector, () =>
          this.firestore
            .collection(this.collectionName)
            .doc(user.uid)
            .collection('entries')
            .doc<DailyFoodEntry>(dateString)
            .valueChanges()
        )
          .pipe(
            map((entry) => {
              if (!entry) {
                return {
                  date: dateString,
                  breakfast: [],
                  lunch: [],
                  dinner: [],
                  snacks: [],
                };
              }
              return entry;
            }),
            catchError((error) => {
              console.error('Error fetching daily entry:', error);
              return throwError(() => error);
            })
          );
      })
    );
  }

  async updateMealItems(
    date: Date,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks',
    items: DayItem[]
  ): Promise<void> {
    try {
      const userId = await this.getCurrentUser();
      const dateString = date.toISOString().split('T')[0];
      const docRef = runInInjectionContext(this.injector, () =>
        this.firestore
          .collection(this.collectionName)
          .doc(userId)
          .collection('entries')
          .doc(dateString)
      );

      await docRef.set(
        {
          date: dateString,
          [mealType]: items,
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error updating meal items:', error);
      throw error;
    }
  }

  /**
   * Appends one item to a meal without loading the day first, so logging
   * from elsewhere (a recipe page) can't overwrite foods it hasn't seen.
   * `dayKey` is the local calendar date, "yyyy-mm-dd".
   */
  async addToMeal(dayKey: string, meal: MealKey, item: DayItem): Promise<void> {
    const ref = await this.dayRef(dayKey);
    await ref.set(
      { date: dayKey, [meal]: firebase.firestore.FieldValue.arrayUnion(item) },
      { merge: true }
    );
  }

  /**
   * Removes the recipe entry with this id. Matches by id, not by the whole
   * object, because the Daily Intake page re-saves items with extra UI fields.
   */
  async removeRecipeEntry(dayKey: string, meal: MealKey, entryId: string): Promise<void> {
    const ref = (await this.dayRef(dayKey)).ref;
    await this.firestore.firestore.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const items: DayItem[] = (snap.data() as Partial<DailyFoodEntry> | undefined)?.[meal] ?? [];
      const kept = items.filter((i) => !(isRecipeEntry(i) && i.entryId === entryId));
      if (kept.length !== items.length) tx.set(ref, { [meal]: kept }, { merge: true });
    });
  }

  private async dayRef(dayKey: string) {
    const userId = await this.getCurrentUser();
    return runInInjectionContext(this.injector, () =>
      this.firestore
        .collection(this.collectionName)
        .doc(userId)
        .collection('entries')
        .doc(dayKey)
    );
  }
}
