import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ShareMenuComponent } from '../share-menu/share-menu.component';
import { SavedMeal } from '../../model/saved-meal';
import { DailyTotal } from '../../model/daily-total';

@Component({
  selector: 'app-saved-meals',
  standalone: true,
  imports: [CommonModule, ShareMenuComponent],
  templateUrl: './saved-meals.component.html',
  styleUrl: './saved-meals.component.css',
})
export class SavedMealsComponent implements OnInit {
  @Input() savedMeals: SavedMeal[] = [];
  @Output() close = new EventEmitter<void>();

  groupedMeals: { [key: string]: SavedMeal[] } = {};
  activeShareMenuDate: string | null = null;
  showShareMenu = false;
  selectedDate = '';
  selectedDayMeals: SavedMeal[] = [];
  selectedDayTotal: DailyTotal | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.groupMealsByDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['savedMeals']) {
      console.log(
        'Updated savedMeals in SavedMealsComponent:',
        this.savedMeals
      );
      this.groupMealsByDate();
    }
  }

  groupMealsByDate() {
    this.groupedMeals = this.savedMeals.reduce(
      (groups: { [key: string]: SavedMeal[] }, meal) => {
        const meals = groups[meal.date] || [];
        groups[meal.date] = [...meals, meal];
        return groups;
      },
      {}
    );
    console.log('Grouped Meals:', this.groupedMeals);
    this.cdr.detectChanges();
  }

  getDailyTotal(meals: SavedMeal[]): DailyTotal {
    return {
      totalOxalate: meals.reduce(
        (sum, meal) => sum + meal.oxalatePerServing,
        0
      ),
      totalSolubleOxalate: meals.reduce(
        (sum, meal) => sum + meal.solubleOxalatePerServing,
        0
      ),
      meals,
    };
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }

  shareDayMeals(date: string, dailyTotal: DailyTotal) {
    this.selectedDate = date;
    this.selectedDayMeals = dailyTotal.meals;
    this.selectedDayTotal = dailyTotal;
    this.showShareMenu = true;
  }

  toggleShareMenu(date: string) {
    this.activeShareMenuDate = this.activeShareMenuDate === date ? null : date;
  }
  closeBtn() {
    // new
    this.close.emit();
  }
}
