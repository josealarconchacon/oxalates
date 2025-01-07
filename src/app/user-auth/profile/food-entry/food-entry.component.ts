import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FoodItem } from '../model/food-item';
import { slideInAnimation } from 'src/app/shared/animations/animations';
import { CalculateOxalateComponent } from '../calculate-oxalate/calculate-oxalate.component';
import { ResultsSectionComponent } from '../calculate-oxalate/results-section/results-section.component';
import { DateSwitcherComponent } from './date-switcher/date-switcher.component';
import { FoodEntryService } from './service/food-entry.service';

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
export class FoodEntryComponent implements OnInit {
  currentDate: Date = new Date();
  breakfastItems: FoodItem[] = [];
  lunchItems: FoodItem[] = [];
  dinnerItems: FoodItem[] = [];
  snackItems: FoodItem[] = [];
  selectedMealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks' = 'breakfast';
  showCalculator: boolean = false;
  showCalculationResult: boolean = false;

  constructor(private foodEntryService: FoodEntryService) {}

  ngOnInit() {
    this.fetchFoodEntries();
  }

  fetchFoodEntries() {
    this.foodEntryService.getDailyEntry(this.currentDate).subscribe((entry) => {
      if (entry) {
        this.breakfastItems = entry.breakfast || [];
        this.lunchItems = entry.lunch || [];
        this.dinnerItems = entry.dinner || [];
        this.snackItems = entry.snacks || [];
      } else {
        this.resetMealItems();
      }
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
      this.addFoodItem(mealType, foodItem);
      await this.foodEntryService.updateMealItems(
        this.currentDate,
        mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
        this.getMealItems(mealType)
      );
    }
  }

  onDateChange(newDate: Date) {
    this.currentDate = newDate;
    this.fetchFoodEntries();
  }

  addFoodItem(mealType: string, foodItem: FoodItem) {
    switch (mealType) {
      case 'breakfast':
        this.breakfastItems.push(foodItem);
        break;
      case 'lunch':
        this.lunchItems.push(foodItem);
        break;
      case 'dinner':
        this.dinnerItems.push(foodItem);
        break;
      case 'snacks':
        this.snackItems.push(foodItem);
        break;
    }
  }

  getMealItems(mealType: string): FoodItem[] {
    switch (mealType) {
      case 'breakfast':
        return this.breakfastItems;
      case 'lunch':
        return this.lunchItems;
      case 'dinner':
        return this.dinnerItems;
      case 'snacks':
        return this.snackItems;
      default:
        return [];
    }
  }

  async deleteFood(mealType: string, index: number) {
    this.getMealItems(mealType).splice(index, 1);
    await this.foodEntryService.updateMealItems(
      this.currentDate,
      mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
      this.getMealItems(mealType)
    );
  }

  closeCalculator() {
    this.showCalculator = false;
  }

  toggleResults() {
    this.showCalculationResult = !this.showCalculationResult;
  }
}
