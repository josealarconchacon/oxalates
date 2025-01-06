import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalculateOxalateComponent } from '../calculate-oxalate/calculate-oxalate.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { ResultsSectionComponent } from '../calculate-oxalate/results-section/results-section.component';

interface FoodItem {
  foodName: string;
  oxalatePerServing: number;
  solubleOxalatePerServing: number;
  servingSize: string;
  numberOfServings: number;
}

@Component({
  selector: 'app-food-entry',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    CalculateOxalateComponent,
    ResultsSectionComponent,
  ],
  templateUrl: './food-entry.component.html',
  styleUrls: ['./food-entry.component.css'],
  animations: [
    trigger('slideInAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '500ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '500ms ease-in',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class FoodEntryComponent {
  currentDate: Date = new Date();
  breakfastItems: FoodItem[] = [];
  lunchItems: FoodItem[] = [];
  dinnerItems: FoodItem[] = [];
  snackItems: FoodItem[] = [];

  selectedMealType: string = '';
  showCalculator: boolean = false;
  showCalculationResult: boolean = false;

  get breakfastTotal(): number {
    return this.calculateMealTotal(this.breakfastItems);
  }

  get lunchTotal(): number {
    return this.calculateMealTotal(this.lunchItems);
  }

  get dinnerTotal(): number {
    return this.calculateMealTotal(this.dinnerItems);
  }

  get snacksTotal(): number {
    return this.calculateMealTotal(this.snackItems);
  }

  get dailyTotal(): number {
    return (
      this.breakfastTotal +
      this.lunchTotal +
      this.dinnerTotal +
      this.snacksTotal
    );
  }

  get breakfastSolubleTotal(): number {
    return this.calculateMealSolubleTotal(this.breakfastItems);
  }

  get lunchSolubleTotal(): number {
    return this.calculateMealSolubleTotal(this.lunchItems);
  }

  get dinnerSolubleTotal(): number {
    return this.calculateMealSolubleTotal(this.dinnerItems);
  }

  get snacksSolubleTotal(): number {
    return this.calculateMealSolubleTotal(this.snackItems);
  }

  ngOnInit() {
    // Initialize any necessary data
  }

  openCalculator(mealType: string) {
    this.selectedMealType = mealType;
    this.showCalculator = true;
  }

  onMealLogged(foodItem: FoodItem) {
    console.log('Logged Food Item:', foodItem);
    switch (this.selectedMealType) {
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
    this.showCalculator = false;
  }

  deleteFood(mealType: string, index: number) {
    switch (mealType) {
      case 'breakfast':
        this.breakfastItems.splice(index, 1);
        break;
      case 'lunch':
        this.lunchItems.splice(index, 1);
        break;
      case 'dinner':
        this.dinnerItems.splice(index, 1);
        break;
      case 'snacks':
        this.snackItems.splice(index, 1);
        break;
    }
  }

  private calculateMealTotal(items: FoodItem[]): number {
    return items.reduce(
      (total, item) => total + item.oxalatePerServing * item.numberOfServings,
      0
    );
  }

  private calculateMealSolubleTotal(items: FoodItem[]): number {
    return items.reduce(
      (total, item) =>
        total + item.solubleOxalatePerServing * item.numberOfServings,
      0
    );
  }

  calculateDailyOxalate() {
    this.showCalculationResult = true;
  }

  closeCalculator() {
    this.showCalculator = false;
  }

  closeCalculationResult() {
    this.showCalculationResult = false;
  }

  // new
  toggleResults() {
    this.showCalculationResult = !this.showCalculationResult;
  }
}
