import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FoodItem } from '../model/food-item';
import { slideInAnimation } from 'src/app/shared/animations/animations';
import { CalculateOxalateComponent } from '../calculate-oxalate/calculate-oxalate.component';
import { ResultsSectionComponent } from '../calculate-oxalate/results-section/results-section.component';
import { DateSwitcherComponent } from './date-switcher/date-switcher.component';
import { FoodEntryService } from './service/food-entry.service';
import { Subscription } from 'rxjs';

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
    this.fetchFoodEntries(); // Load food entries for the current date
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

    this.resetMealItems(); // Clear the UI before fetching new data

    const utcDate = convertToUTC(this.currentDate); // Use UTC date
    this.subscription = this.foodEntryService.getDailyEntry(utcDate).subscribe({
      next: (entry) => {
        if (entry) {
          this.breakfastItems = entry.breakfast || [];
          this.lunchItems = entry.lunch || [];
          this.dinnerItems = entry.dinner || [];
          this.snackItems = entry.snacks || [];
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
      const updatedItems = [...this.getMealItems(mealType), foodItem];
      try {
        const utcDate = convertToUTC(this.currentDate);
        await this.foodEntryService.updateMealItems(
          utcDate,
          mealType,
          updatedItems
        );
        this.fetchFoodEntries(); // Refresh data after logging
        this.closeCalculator();
      } catch (error) {
        console.error('Error logging meal:', error);
      }
    }
  }

  onDateChange(newDate: Date) {
    const cleanDate = new Date(newDate.toISOString().split('T')[0]);
    this.currentDate = cleanDate;
    this.fetchFoodEntries(); // Fetch entries for the new date
  }

  addFoodItem(mealType: string, foodItem: FoodItem) {
    const items = this.getMealItems(mealType);
    switch (mealType) {
      case 'breakfast':
        this.breakfastItems = [...items, foodItem];
        break;
      case 'lunch':
        this.lunchItems = [...items, foodItem];
        break;
      case 'dinner':
        this.dinnerItems = [...items, foodItem];
        break;
      case 'snacks':
        this.snackItems = [...items, foodItem];
        break;
    }
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
      const utcDate = convertToUTC(this.currentDate); // Ensure consistent date usage
      await this.foodEntryService.updateMealItems(
        utcDate,
        mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
        updatedItems
      );
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
}

function convertToUTC(currentDate: Date): Date {
  const utcDate = new Date(
    Date.UTC(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      currentDate.getHours(),
      currentDate.getMinutes(),
      currentDate.getSeconds()
    )
  );
  return utcDate;
}
