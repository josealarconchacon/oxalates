import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';

export interface FoodItem {
  foodName: string;
  oxalatePerServing: number;
  solubleOxalatePerServing: number;
  servingSize: string;
  numberOfServings: number;
}

export interface DailyFoodEntry {
  date: string;
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  snacks: FoodItem[];
}

@Injectable({
  providedIn: 'root',
})
export class FoodEntryService {
  private readonly collectionName = 'foodEntries';

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
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
        return this.firestore
          .collection(this.collectionName)
          .doc(user.uid)
          .collection('entries')
          .doc<DailyFoodEntry>(dateString)
          .valueChanges()
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
    items: FoodItem[]
  ): Promise<void> {
    try {
      const userId = await this.getCurrentUser();
      const dateString = date.toISOString().split('T')[0];
      const docRef = this.firestore
        .collection(this.collectionName)
        .doc(userId)
        .collection('entries')
        .doc(dateString);

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
}
