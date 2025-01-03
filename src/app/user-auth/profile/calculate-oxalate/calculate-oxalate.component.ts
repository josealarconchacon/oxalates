import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CalculateOxalateService } from 'src/app/landing-page/dialog-service/service/calculate-oxalate.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResultsSectionComponent } from './results-section/results-section.component';
import { SearchSectionComponent } from './search-section/search-section.component';
import { ServingPanelComponent } from './serving-panel/serving-panel.component';
import { SavedMealsComponent } from './saved-meals/saved-meals.component';
import { SimilarFood } from '../model/similar-food';
import { SavedMeal } from '../model/saved-meal';
import { BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-calculate-oxalate',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ResultsSectionComponent,
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
  servingGrams: number = 0;
  customServing: number | null = null;
  oxalatePerServing: number = 0;
  solubleOxalatePerServing: number = 0;
  isCalculating: boolean = false;
  similarFoods: SimilarFood[] = [];
  showSuggestions: boolean = false;
  savedMeals: SavedMeal[] = [];
  isMoved: boolean = false;
  isSavedMealsVisible: boolean = false;
  isMobileView: boolean = false;

  private foodInputSubject = new BehaviorSubject<string>('');

  constructor(
    private oxalateService: CalculateOxalateService,
    private cdr: ChangeDetectorRef
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
  }

  ngOnDestroy() {
    window.removeEventListener('resize', () => this.checkMobileView());
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
  }

  onFoodNameChange(foodName: string): void {
    this.foodInputSubject.next(foodName);
  }

  calculateOxalate(): void {
    this.isCalculating = true;
    const result = this.oxalateService.calculateOxalate(
      this.foodName,
      this.customServing || this.servingGrams
    );
    this.oxalatePerServing = result.totalOxalate;
    this.solubleOxalatePerServing = result.solubleOxalate;
    this.isCalculating = false;
  }

  clearResults(): void {
    this.foodName = '';
    this.servingSize = '';
    this.servingGrams = 0;
    this.customServing = null;
    this.oxalatePerServing = 0;
    this.solubleOxalatePerServing = 0;
    this.showSuggestions = false;
  }

  suggestSimilarFoods(input: string): void {
    this.similarFoods = this.oxalateService
      .findSimilarFoods(input)
      .map((food) => ({
        ...food,
        confidenceLevel: this.getConfidenceLevel(food.similarity),
      }));
    this.showSuggestions = this.similarFoods.length > 0;
  }

  selectSuggestedFood(food: SimilarFood): void {
    this.foodName = food.name;
    this.servingSize = `${food.totalOxalate} mg/100g`;
    this.servingGrams = food.servingGrams;
    this.customServing = this.servingGrams;
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
      oxalatePerServing: this.oxalatePerServing,
      solubleOxalatePerServing: this.solubleOxalatePerServing,
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
}
