import { CalculateOxalateComponent } from './calculate-oxalate.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculateOxalateService } from 'src/app/landing-page/dialog-service/service/calculate-oxalate.service';
import { of } from 'rxjs';
import { SimilarFood } from '../model/similar-food';
import { SavedMeal } from '../model/saved-meal';

describe('CalculateOxalateComponent', () => {
  let component: CalculateOxalateComponent;
  let fixture: ComponentFixture<CalculateOxalateComponent>;
  let calculateOxalateService: jasmine.SpyObj<CalculateOxalateService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CalculateOxalateService', [
      'calculateOxalate',
      'findSimilarFoods',
      'getConfidenceLevel',
    ]);

    await TestBed.configureTestingModule({
      imports: [CalculateOxalateComponent],
      providers: [{ provide: CalculateOxalateService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculateOxalateComponent);
    component = fixture.componentInstance;
    calculateOxalateService = TestBed.inject(
      CalculateOxalateService
    ) as jasmine.SpyObj<CalculateOxalateService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('checkMobileView', () => {
    it('should set isMobileView to true if window width is less than or equal to 768', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        writable: true,
      });
      component.checkMobileView();
      expect(component.isMobileView).toBe(true);
    });

    it('should set isMobileView to false if window width is greater than 768', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 769,
        writable: true,
      });
      component.checkMobileView();
      expect(component.isMobileView).toBe(false);
    });
  });

  describe('onNumberOfServingsChange', () => {
    it('should set numberOfServings to the parsed value if valid', () => {
      component.onNumberOfServingsChange('2');
      expect(component.numberOfServings).toBe(2);
    });

    it('should set numberOfServings to 1 if the provided value is invalid', () => {
      component.onNumberOfServingsChange('invalid');
      expect(component.numberOfServings).toBe(1);
    });
  });

  describe('calculateOxalate', () => {
    it('should alert and not calculate if serving size is invalid', () => {
      spyOn(window, 'alert');
      component.servingSize = 'invalid';
      component.calculateOxalate();
      expect(window.alert).toHaveBeenCalledWith(
        'Please enter a valid serving size.'
      );
    });

    it('should alert and not calculate if number of servings is invalid', () => {
      spyOn(window, 'alert');
      component.servingSize = '100';
      component.numberOfServings = NaN;
      component.calculateOxalate();
      expect(window.alert).toHaveBeenCalledWith(
        'Please enter a valid number of servings.'
      );
    });

    it('should calculate oxalate and update properties if inputs are valid', () => {
      const mockResult = { totalOxalate: 10, solubleOxalate: 5 };
      calculateOxalateService.calculateOxalate.and.returnValue(mockResult);
      component.foodName = 'Carrot';
      component.servingSize = '100';
      component.numberOfServings = 2;
      component.calculateOxalate();
      expect(component.calculatedTotalOxalate).toBe(20);
      expect(component.calculatedTotalSolubleOxalate).toBe(10);
      expect(component.showResults).toBe(true);
    });
  });

  describe('suggestSimilarFoods', () => {
    it('should call findSimilarFoods and update similarFoods and showSuggestions', () => {
      calculateOxalateService.findSimilarFoods.and.returnValue(
        mockSimilarFoods
      );
      component.suggestSimilarFoods('Carrot');
      expect(component.similarFoods.length).toBe(1);
      expect(component.showSuggestions).toBe(true);
    });
  });

  describe('selectSuggestedFood', () => {
    it('should update foodName, servingSize, totalOxalatePerServing, totalSolubleOxalatePerServing, and clear suggestions', () => {
      component.selectSuggestedFood(mockFood);
      expect(component.foodName).toBe('Carrot');
      expect(component.servingSize).toBe('100');
      expect(component.totalOxalatePerServing).toBe(10);
      expect(component.totalSolubleOxalatePerServing).toBe(5);
      expect(component.showSuggestions).toBe(false);
    });
  });

  describe('clearResults', () => {
    it('should reset all relevant properties', () => {
      component.foodName = 'Carrot';
      component.servingSize = '100';
      component.numberOfServings = 2;
      component.totalOxalatePerServing = 10;
      component.totalSolubleOxalatePerServing = 5;
      component.calculatedTotalOxalate = 20;
      component.calculatedTotalSolubleOxalate = 10;
      component.showResults = true;
      component.showSuggestions = true;
      component.clearResults();
      expect(component.foodName).toBe('');
      expect(component.servingSize).toBe('');
      expect(component.numberOfServings).toBe(1);
      expect(component.totalOxalatePerServing).toBe(0);
      expect(component.totalSolubleOxalatePerServing).toBe(0);
      expect(component.calculatedTotalOxalate).toBe(0);
      expect(component.calculatedTotalSolubleOxalate).toBe(0);
      expect(component.showResults).toBe(false);
      expect(component.showSuggestions).toBe(false);
    });
  });

  describe('saveMeal', () => {
    it('should add a new meal to savedMeals and clear results', () => {
      component.foodName = 'Carrot';
      component.calculatedTotalOxalate = 20;
      component.calculatedTotalSolubleOxalate = 10;
      component.saveMeal();
      expect(component.savedMeals.length).toBe(1);
      expect(component.foodName).toBe('');
      expect(component.calculatedTotalOxalate).toBe(0);
      expect(component.calculatedTotalSolubleOxalate).toBe(0);
    });
  });

  describe('toggleSavedMeals', () => {
    it('should toggle isSavedMealsVisible and isMoved', () => {
      component.toggleSavedMeals();
      expect(component.isSavedMealsVisible).toBe(true);
      expect(component.isMoved).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');
      component.toggleSavedMeals();
      expect(component.isSavedMealsVisible).toBe(false);
      expect(component.isMoved).toBe(false);
      expect(document.body.style.overflow).toBe('auto');
    });
  });

  describe('resetView', () => {
    it('should reset isMoved, isSavedMealsVisible, and document body overflow', () => {
      component.isMoved = true;
      component.isSavedMealsVisible = true;
      document.body.style.overflow = 'hidden';
      component.resetView();
      expect(component.isMoved).toBe(false);
      expect(component.isSavedMealsVisible).toBe(false);
      expect(document.body.style.overflow).toBe('auto');
    });
  });

  describe('onDeleteMeal', () => {
    it('should delete the meal at the specified index', () => {
      component.savedMeals = [meal1, meal2];
      component.onDeleteMeal({ date: '2023-10-01', index: 0 });
      expect(component.savedMeals.length).toBe(1);
      expect(component.savedMeals[0]).toBe(meal2);
    });
  });

  describe('logMeal', () => {
    it('should emit mealLogged event with the correct meal data', () => {
      const mockResult = { totalOxalate: 10, solubleOxalate: 5 };
      calculateOxalateService.calculateOxalate.and.returnValue(mockResult);

      component.foodName = 'Carrot';
      component.servingSize = '100';
      component.numberOfServings = 2;
      component.calculateOxalate();
      spyOn(component.mealLogged, 'emit');
      component.logMeal();
      expect(component.mealLogged.emit).toHaveBeenCalledWith({
        foodName: 'Carrot',
        oxalatePerServing: 10,
        solubleOxalatePerServing: 5,
        servingSize: '100',
        numberOfServings: 2,
      });
    });
  });
});

const mockSimilarFoods = [
  {
    name: 'Carrot',
    similarity: 0.9,
    servingGrams: 100,
    totalOxalate: 10,
    solubleOxalate: 5,
  },
];

const mockFood: SimilarFood = {
  name: 'Carrot',
  servingSize: '100',
  totalOxalate: 10,
  solubleOxalate: 5,
  confidenceLevel: 'High',
  similarity: 0,
};

const meal1: SavedMeal = {
  foodName: 'Carrot',
  oxalatePerServing: 20,
  solubleOxalatePerServing: 10,
  date: '2023-10-01',
};
const meal2: SavedMeal = {
  foodName: 'Broccoli',
  oxalatePerServing: 15,
  solubleOxalatePerServing: 8,
  date: '2023-10-01',
};
