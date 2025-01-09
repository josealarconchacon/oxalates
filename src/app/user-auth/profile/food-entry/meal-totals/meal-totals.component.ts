import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface FoodItem {
  foodName: string;
  servingSize: string;
  numberOfServings: number;
  oxalatePerServing: number;
  solubleOxalatePerServing: number;
}

@Component({
  selector: 'app-meal-totals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meal-totals.component.html',
  styleUrl: './meal-totals.component.css',
})
export class MealTotalsComponent {
  @Input() mealItems: FoodItem[] = [];

  get totalOxalate(): number {
    return this.calculateTotalOxalate(this.mealItems);
  }

  get totalSolubleOxalate(): number {
    return this.calculateTotalSolubleOxalate(this.mealItems);
  }

  private calculateTotalOxalate(items: FoodItem[]): number {
    return items.reduce(
      (total, food) =>
        total + (food.oxalatePerServing || 0) * (food.numberOfServings || 0),
      0
    );
  }

  private calculateTotalSolubleOxalate(items: FoodItem[]): number {
    return items.reduce(
      (total, food) =>
        total +
        (food.solubleOxalatePerServing || 0) * (food.numberOfServings || 0),
      0
    );
  }
}
