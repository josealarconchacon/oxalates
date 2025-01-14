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

  readonly MAX_GREEN = 50; // Maximum value for green section
  readonly MAX_YELLOW = 350; // Maximum value for yellow section
  readonly MAX_RED = 500; // Maximum value for red section
  readonly MAX_RED_HEIGHT = 1000; // Maximum value for dark red section

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

  hasFoodItems(): boolean {
    return (
      this.breakfastItems.length > 0 ||
      this.lunchItems.length > 0 ||
      this.dinnerItems.length > 0 ||
      this.snackItems.length > 0
    );
  }

  getOxalateLevel(totalOxalate: number): string {
    if (totalOxalate <= this.MAX_GREEN) {
      return 'Low';
    } else if (totalOxalate <= this.MAX_YELLOW) {
      return 'Medium';
    } else if (totalOxalate <= this.MAX_RED) {
      return 'High';
    } else {
      return 'Very High';
    }
  }

  getGreenWidth(): string {
    if (this.totalOxalate <= this.MAX_GREEN) {
      return `${(this.totalOxalate / this.MAX_GREEN) * 25}%`;
    }
    return '25%';
  }

  getYellowWidth(): string {
    if (this.totalOxalate <= this.MAX_GREEN) {
      return '0%';
    }
    if (this.totalOxalate <= this.MAX_YELLOW) {
      const yellowValue = this.totalOxalate - this.MAX_GREEN;
      return `${(yellowValue / (this.MAX_YELLOW - this.MAX_GREEN)) * 25}%`;
    }
    return '25%';
  }

  getRedWidth(): string {
    if (this.totalOxalate <= this.MAX_YELLOW) {
      return '0%';
    }
    if (this.totalOxalate <= this.MAX_RED) {
      const redValue = this.totalOxalate - this.MAX_YELLOW;
      return `${(redValue / (this.MAX_RED - this.MAX_YELLOW)) * 25}%`;
    }
    return '25%';
  }

  getDarkRedWidth(): string {
    if (this.totalOxalate <= this.MAX_RED) {
      return '0%';
    }
    const darkRedValue = this.totalOxalate - this.MAX_RED;
    const percentage = Math.min(
      (darkRedValue / (this.MAX_RED_HEIGHT - this.MAX_RED)) * 25,
      25
    );
    return `${percentage}%`;
  }

  getGreenOpacity(): number {
    return this.totalOxalate <= this.MAX_GREEN ? 1 : 0.3;
  }

  getYellowOpacity(): number {
    return this.totalOxalate > this.MAX_GREEN &&
      this.totalOxalate <= this.MAX_YELLOW
      ? 1
      : 0.3;
  }

  getRedOpacity(): number {
    return this.totalOxalate > this.MAX_YELLOW &&
      this.totalOxalate <= this.MAX_RED
      ? 1
      : 0.3;
  }

  getDarkRedOpacity(): number {
    return this.totalOxalate > this.MAX_RED ? 1 : 0.3;
  }
}
