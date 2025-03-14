import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { CalculateOxalateService } from 'src/app/landing-page/dialog-service/service/calculate-oxalate.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchSectionComponent } from './search-section/search-section.component';
import { ServingPanelComponent } from './serving-panel/serving-panel.component';
import { SavedMealsComponent } from './saved-meals/saved-meals.component';
import { SimilarFood } from '../model/similar-food';
import { SavedMeal } from '../model/saved-meal';
import {
  BehaviorSubject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import { ThemeService } from 'src/app/shared/services/theme.service';

@Component({
  selector: 'app-calculate-oxalate',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchSectionComponent,
    ServingPanelComponent,
    SavedMealsComponent,
  ],
  templateUrl: './calculate-oxalate.component.html',
  styleUrls: ['./calculate-oxalate.component.css'],
})
export class CalculateOxalateComponent implements OnInit, OnDestroy {
  foodName: string = '';
  servingSize: string = '';
  numberOfServings: number = 1; // Default to 1 serving
  totalOxalatePerServing: number = 0;
  totalSolubleOxalatePerServing: number = 0;
  calculatedTotalOxalate: number = 0;
  calculatedTotalSolubleOxalate: number = 0;
  isCalculating: boolean = false;
  similarFoods: SimilarFood[] = [];
  showSuggestions: boolean = false;
  savedMeals: SavedMeal[] = [];
  isMoved: boolean = false;
  isSavedMealsVisible: boolean = false;
  isMobileView: boolean = false;
  showResults: boolean = false;
  isDarkTheme: boolean = false;

  @Input() mealType: string = '';
  @Output() mealLogged = new EventEmitter<any>();

  private foodInputSubject = new BehaviorSubject<string>('');
  private themeSubscription: Subscription | null = null;

  constructor(
    private oxalateService: CalculateOxalateService,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService
  ) {
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
  }

  ngOnInit() {
    this.foodInputSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((foodName) => {
        if (foodName && foodName.trim()) {
          this.suggestSimilarFoods(foodName.trim());
        } else {
          this.clearSuggestions();
        }
      });

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.isDarkTheme$.subscribe(
      (isDark) => {
        this.isDarkTheme = isDark;
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy() {
    window.removeEventListener('resize', () => this.checkMobileView());
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
  }

  onFoodNameChange(foodName: string): void {
    this.foodInputSubject.next(foodName);
  }

  onNumberOfServingsChange(numberOfServings: string): void {
    this.numberOfServings = parseFloat(numberOfServings) || 1;
  }

  calculateOxalate(): void {
    console.log('Calculate button clicked');
    this.isCalculating = true;
    const servingSizeValue = this.parseServingSize(this.servingSize);
    if (servingSizeValue === null) {
      alert('Food can not be logged as serving size is not available.');
      this.isCalculating = false;
      return;
    }

    const numberOfServingsValue = this.parseNumberOfServings(
      this.numberOfServings.toString()
    );
    if (numberOfServingsValue === null) {
      alert('Food can not be logged as serving size is not available.');
      this.isCalculating = false;
      return;
    }

    const result = this.oxalateService.calculateOxalate(
      this.foodName,
      servingSizeValue
    );
    console.log('Calculation result:', result);

    // service returns oxalate and soluble oxalate per serving
    this.totalOxalatePerServing = result.totalOxalate;
    this.totalSolubleOxalatePerServing = result.solubleOxalate;

    this.calculatedTotalOxalate =
      this.totalOxalatePerServing * numberOfServingsValue;
    this.calculatedTotalSolubleOxalate =
      this.totalSolubleOxalatePerServing * numberOfServingsValue;

    this.showResults = true;
    this.isCalculating = false;
  }

  private parseServingSize(servingSize: string): number | null {
    const numericValue = parseFloat(servingSize);
    if (!isNaN(numericValue) && numericValue > 0) {
      return numericValue;
    }
    return null;
  }

  private parseNumberOfServings(numberOfServings: string): number | null {
    const numericValue = parseFloat(numberOfServings);
    if (!isNaN(numericValue) && numericValue > 0) {
      return numericValue;
    }
    return null;
  }

  clearResults(): void {
    this.foodName = '';
    this.servingSize = '';
    this.numberOfServings = 1;
    this.totalOxalatePerServing = 0;
    this.totalSolubleOxalatePerServing = 0;
    this.calculatedTotalOxalate = 0;
    this.calculatedTotalSolubleOxalate = 0;
    this.showResults = false;
    this.showSuggestions = false;
  }

  suggestSimilarFoods(input: string): void {
    this.similarFoods = this.oxalateService
      .findSimilarFoods(input)
      .map((food) => ({
        ...food,
        confidenceLevel: this.getConfidenceLevel(food.similarity),
        servingSize: `${food.servingGrams}`,
      }));
    this.showSuggestions = this.similarFoods.length > 0;
  }

  selectSuggestedFood(food: SimilarFood): void {
    this.foodName = food.name;
    // this.servingSize = food.servingSize;
    const parsedServingSize = parseFloat(food.servingSize);
    if (isNaN(parsedServingSize) || parsedServingSize <= 0) {
      this.servingSize = 'no available';
    } else {
      this.servingSize = food.servingSize;
    }
    console.log('Final serving size:', this.servingSize);
    this.totalOxalatePerServing = food.totalOxalate;
    this.totalSolubleOxalatePerServing = food.solubleOxalate;
    this.showResults = false;
    this.showSuggestions = false;
  }

  clearSuggestions(): void {
    this.similarFoods = [];
    this.showSuggestions = false;
  }

  getConfidenceLevel(similarity: number): string {
    return this.oxalateService.getConfidenceLevel(similarity);
  }

  saveMeal(): void {
    const currentDate = new Date().toISOString().split('T')[0];
    const savedMeal: SavedMeal = {
      foodName: this.foodName,
      oxalatePerServing: this.calculatedTotalOxalate,
      solubleOxalatePerServing: this.calculatedTotalSolubleOxalate,
      date: currentDate,
    };
    this.savedMeals = [...this.savedMeals, savedMeal];
    console.log('Meal saved successfully!');
    this.cdr.detectChanges();
    this.clearResults();
  }

  toggleSavedMeals(): void {
    console.log('Toggle Saved Meals:', this.isSavedMealsVisible);
    this.isSavedMealsVisible = !this.isSavedMealsVisible;
    console.log('New State:', this.isSavedMealsVisible);
    this.isMoved = this.isSavedMealsVisible;
    if (this.isSavedMealsVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  resetView(): void {
    this.isMoved = false;
    this.isSavedMealsVisible = false;
    document.body.style.overflow = 'auto';
  }

  onDeleteMeal(event: { date: string; index: number }): void {
    const { date, index } = event;
    const mealsOnDate = this.savedMeals.filter((meal) => meal.date === date);

    if (index >= 0 && index < mealsOnDate.length) {
      const mealToDelete = mealsOnDate[index];
      const mealIndexInSavedMeals = this.savedMeals.indexOf(mealToDelete);

      if (mealIndexInSavedMeals !== -1) {
        this.savedMeals.splice(mealIndexInSavedMeals, 1);
      }
    }
  }

  onEditMeal(event: { meal: SavedMeal; date: string; index: number }): void {
    // logic to handle meal editing
    console.log('Edit meal:', event);
  }

  logMeal(): void {
    this.calculateOxalate();
    if (this.showResults) {
      const meal = {
        foodName: this.foodName,
        oxalatePerServing: this.totalOxalatePerServing,
        solubleOxalatePerServing: this.totalSolubleOxalatePerServing,
        servingSize: this.servingSize,
        numberOfServings: this.numberOfServings,
      };
      this.mealLogged.emit(meal);
      this.clearResults();
    }
  }
}
