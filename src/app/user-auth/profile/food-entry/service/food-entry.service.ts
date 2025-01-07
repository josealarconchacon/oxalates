import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { Observable } from 'rxjs';

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
    return new Observable((observer) => {
      this.authService.getCurrentUser().then((user) => {
        if (user) {
          const dateString = date.toISOString().split('T')[0];
          this.firestore
            .collection(this.collectionName)
            .doc(user.uid)
            .collection('entries')
            .doc<DailyFoodEntry>(dateString)
            .valueChanges()
            .subscribe(
              (entry) => {
                observer.next(entry);
              },
              (err) => observer.error(err)
            );
        } else {
          observer.error('No user found');
        }
      });
    });
  }

  async updateMealItems(
    date: Date,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks',
    items: FoodItem[]
  ): Promise<void> {
    const userId = await this.getCurrentUser();
    const dateString = date.toISOString().split('T')[0];
    await this.firestore
      .collection(this.collectionName)
      .doc(userId)
      .collection('entries')
      .doc(dateString)
      .set(
        {
          date: dateString,
          [mealType]: items,
        },
        { merge: true }
      );
  }
}
