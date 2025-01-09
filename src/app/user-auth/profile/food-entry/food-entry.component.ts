import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { FoodItem } from '../model/food-item';
import { slideInAnimation } from 'src/app/shared/animations/animations';
import { CalculateOxalateComponent } from '../calculate-oxalate/calculate-oxalate.component';
import { ResultsSectionComponent } from '../calculate-oxalate/results-section/results-section.component';
import { DateSwitcherComponent } from './date-switcher/date-switcher.component';
import { FoodEntryService } from './service/food-entry.service';
import { Subscription } from 'rxjs';

// Update the FoodItem interface in your models
export interface FoodItem {
  foodName: string;
  servingSize: string;
  numberOfServings: number;
  oxalatePerServing: number;
  solubleOxalatePerServing: number;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-food-entry',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    CalculateOxalateComponent,
    ResultsSectionComponent,
    DateSwitcherComponent,
  ],
  templateUrl: './food-entry.component.html',
  styleUrls: ['./food-entry.component.css'],
  animations: [slideInAnimation],
})
export class FoodEntryComponent implements OnInit, OnDestroy {
  lunchItems: FoodItem[] = [];
  snackItems: FoodItem[] = [];
  dinnerItems: FoodItem[] = [];
  breakfastItems: FoodItem[] = [];

  currentDate: Date = new Date();
  showCalculator: boolean = false;
  showCalculationResult: boolean = false;
  private subscription: Subscription | null = null;
  selectedMealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks' = 'breakfast';

  constructor(private foodEntryService: FoodEntryService) {}

  ngOnInit() {
    this.fetchFoodEntries();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  fetchFoodEntries() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.resetMealItems();

    const utcDate = this.convertToUTC(this.currentDate);
    this.subscription = this.foodEntryService.getDailyEntry(utcDate).subscribe({
      next: (entry) => {
        if (entry) {
          // Initialize each food item with isExpanded set to false
          this.breakfastItems = (entry.breakfast || []).map((item) => ({
            ...item,
            isExpanded: false,
          }));
          this.lunchItems = (entry.lunch || []).map((item) => ({
            ...item,
            isExpanded: false,
          }));
          this.dinnerItems = (entry.dinner || []).map((item) => ({
            ...item,
            isExpanded: false,
          }));
          this.snackItems = (entry.snacks || []).map((item) => ({
            ...item,
            isExpanded: false,
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching food entries:', error);
        this.resetMealItems();
      },
    });
  }

  private resetMealItems() {
    this.breakfastItems = [];
    this.lunchItems = [];
    this.dinnerItems = [];
    this.snackItems = [];
  }

  openCalculator(mealType: string) {
    this.selectedMealType = mealType as
      | 'breakfast'
      | 'lunch'
      | 'dinner'
      | 'snacks';
    this.showCalculator = true;
  }

  async onMealLogged(foodItem: FoodItem) {
    const mealType = this.selectedMealType;
    if (mealType) {
      const updatedItems = [
        ...this.getMealItems(mealType),
        { ...foodItem, isExpanded: false },
      ];
      try {
        const utcDate = this.convertToUTC(this.currentDate);
        await this.foodEntryService.updateMealItems(
          utcDate,
          mealType,
          updatedItems
        );
        this.fetchFoodEntries();
        this.closeCalculator();
      } catch (error) {
        console.error('Error logging meal:', error);
      }
    }
  }

  onDateChange(newDate: Date) {
    const cleanDate = new Date(newDate.toISOString().split('T')[0]);
    this.currentDate = cleanDate;
    this.fetchFoodEntries();
  }

  getMealItems(mealType: string): FoodItem[] {
    switch (mealType) {
      case 'breakfast':
        return [...this.breakfastItems];
      case 'lunch':
        return [...this.lunchItems];
      case 'dinner':
        return [...this.dinnerItems];
      case 'snacks':
        return [...this.snackItems];
      default:
        return [];
    }
  }

  async deleteFood(mealType: string, index: number) {
    const updatedItems = this.getMealItems(mealType).filter(
      (_, i) => i !== index
    );

    try {
      const utcDate = this.convertToUTC(this.currentDate);
      await this.foodEntryService.updateMealItems(
        utcDate,
        mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
        updatedItems
      );

      // Update the local arrays
      switch (mealType) {
        case 'breakfast':
          this.breakfastItems = updatedItems;
          break;
        case 'lunch':
          this.lunchItems = updatedItems;
          break;
        case 'dinner':
          this.dinnerItems = updatedItems;
          break;
        case 'snacks':
          this.snackItems = updatedItems;
          break;
      }
    } catch (error) {
      console.error('Error deleting food item:', error);
    }
  }

  closeCalculator() {
    this.showCalculator = false;
  }

  toggleResults() {
    this.showCalculationResult = !this.showCalculationResult;
  }

  private convertToUTC(date: Date): Date {
    return new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      )
    );
  }

  calculateTotalOxalate(items: FoodItem[]): number {
    return items.reduce(
      (total, food) =>
        total + (food.oxalatePerServing || 0) * (food.numberOfServings || 0),
      0
    );
  }

  calculateTotalSolubleOxalate(items: FoodItem[]): number {
    return items.reduce(
      (total, food) =>
        total +
        (food.solubleOxalatePerServing || 0) * (food.numberOfServings || 0),
      0
    );
  }
}
