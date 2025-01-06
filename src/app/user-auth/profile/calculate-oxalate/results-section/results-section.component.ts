import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ShareMenuComponent } from '../share-menu/share-menu.component';

@Component({
  selector: 'app-results-section',
  standalone: true,
  imports: [CommonModule, ShareMenuComponent],
  templateUrl: './results-section.component.html',
  styleUrls: ['./results-section.component.css'],
})
export class ResultsSectionComponent {
  @Input() breakfastItems: any[] = [];
  @Input() lunchItems: any[] = [];
  @Input() dinnerItems: any[] = [];
  @Input() snackItems: any[] = [];

  shareMenuVisible = false;

  get mealItems() {
    const meals = [
      { title: 'Breakfast', items: this.breakfastItems },
      { title: 'Lunch', items: this.lunchItems },
      { title: 'Dinner', items: this.dinnerItems },
      { title: 'Snacks', items: this.snackItems },
    ];
    return meals.filter((meal) => meal.items.length > 0);
  }

  get totalOxalate(): number {
    return (
      this.calculateTotalOxalate(this.breakfastItems) +
      this.calculateTotalOxalate(this.lunchItems) +
      this.calculateTotalOxalate(this.dinnerItems) +
      this.calculateTotalOxalate(this.snackItems)
    );
  }

  get totalSolubleOxalate(): number {
    return (
      this.calculateTotalSolubleOxalate(this.breakfastItems) +
      this.calculateTotalSolubleOxalate(this.lunchItems) +
      this.calculateTotalSolubleOxalate(this.dinnerItems) +
      this.calculateTotalSolubleOxalate(this.snackItems)
    );
  }

  private calculateTotalOxalate(items: any[]): number {
    return items.reduce(
      (total, food) =>
        total + (food.oxalatePerServing || 0) * (food.numberOfServings || 0),
      0
    );
  }

  private calculateTotalSolubleOxalate(items: any[]): number {
    return items.reduce(
      (total, food) =>
        total +
        (food.solubleOxalatePerServing || 0) * (food.numberOfServings || 0),
      0
    );
  }

  openShareMenu(): void {
    this.shareMenuVisible = true;
  }

  closeShareMenu(): void {
    this.shareMenuVisible = false;
  }
}
