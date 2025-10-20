import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FilterComponent } from './filter.component';
import { CategoryService } from '../service/category.service';
import { FilterService } from '../service/filter.service';
import { ThemeService } from 'src/app/shared/services/theme.service';
import { Subject } from 'rxjs';
import { Filter } from './model/filter';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let filterService: jasmine.SpyObj<FilterService>;
  let themeService: jasmine.SpyObj<ThemeService>;

  let categorySubject: Subject<string | undefined>;
  let filterSubject: Subject<Filter>;
  let themeSubject: Subject<boolean>;

  beforeEach(() => {
    categorySubject = new Subject<string | undefined>();
    filterSubject = new Subject<Filter>();
    themeSubject = new Subject<boolean>();

    categoryService = jasmine.createSpyObj('CategoryService', ['clearAll'], {
      currentCategory$: categorySubject.asObservable(),
    });

    filterService = jasmine.createSpyObj(
      'FilterService',
      ['updateFilter', 'clearAll'],
      {
        currentFilter$: filterSubject.asObservable(),
      }
    );

    themeService = jasmine.createSpyObj('ThemeService', [], {
      isDarkTheme$: themeSubject.asObservable(),
    });

    TestBed.configureTestingModule({
      declarations: [FilterComponent],
      imports: [FormsModule],
      providers: [
        { provide: CategoryService, useValue: categoryService },
        { provide: FilterService, useValue: filterService },
        { provide: ThemeService, useValue: themeService },
      ],
    });

    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    categorySubject.complete();
    filterSubject.complete();
    themeSubject.complete();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.filters).toEqual({ category: '', calc_level: '' });
      expect(component.searchQuery).toBe('');
      expect(component.isDarkTheme).toBe(false);
      expect(component.categories).toBeDefined();
      expect(component.calcLevels).toBeDefined();
      expect(component.levels).toBeDefined();
    });

    it('should have non-empty category, calcLevel, and level arrays', () => {
      expect(Array.isArray(component.categories)).toBeTrue();
      expect(component.categories.length).toBeGreaterThan(0);
      expect(Array.isArray(component.calcLevels)).toBeTrue();
      expect(component.calcLevels.length).toBeGreaterThan(0);
      expect(Array.isArray(component.levels)).toBeTrue();
      expect(component.levels.length).toBeGreaterThan(0);
    });
  });

  describe('ngOnInit', () => {
    it('should call onCategoryChange and onFilterChange', () => {
      spyOn(component, 'onCategoryChange');
      spyOn(component, 'onFilterChange');

      component.ngOnInit();

      expect(component.onCategoryChange).toHaveBeenCalledTimes(1);
      expect(component.onFilterChange).toHaveBeenCalledTimes(1);
    });

    it('should subscribe to theme changes', () => {
      component.ngOnInit();

      themeSubject.next(true);
      expect(component.isDarkTheme).toBeTrue();

      themeSubject.next(false);
      expect(component.isDarkTheme).toBeFalse();
    });

    it('should add theme subscription to subscriptions array', () => {
      const initialLength = component['subscriptions'].length;
      component.ngOnInit();

      expect(component['subscriptions'].length).toBeGreaterThan(initialLength);
    });

    it('should set up all subscriptions correctly', () => {
      component.ngOnInit();

      expect(component['subscriptions'].length).toBe(3);
    });
  });

  describe('onCategoryChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should subscribe to categoryService.currentCategory$', () => {
      const initialSubscriptionCount = component['subscriptions'].length;

      component.onCategoryChange();

      expect(component['subscriptions'].length).toBe(
        initialSubscriptionCount + 1
      );
    });

    it('should update filters.category when category changes', () => {
      component.onCategoryChange();
      const newCategory = 'Fruits';

      categorySubject.next(newCategory);

      expect(component.filters.category).toBe(newCategory);
    });

    it('should call applyFilters when category changes', () => {
      spyOn(component, 'applyFilters');
      component.onCategoryChange();

      categorySubject.next('Vegetables');

      expect(component.applyFilters).toHaveBeenCalledTimes(1);
    });

    it('should not call applyFilters if category is the same', () => {
      spyOn(component, 'applyFilters');
      component.filters.category = 'Dairy';
      component.onCategoryChange();

      categorySubject.next('Dairy');

      expect(component.applyFilters).not.toHaveBeenCalled();
    });

    it('should handle undefined category by setting empty string', () => {
      spyOn(component, 'applyFilters');
      component.filters.category = 'Fruits';
      component.onCategoryChange();

      categorySubject.next(undefined);

      expect(component.filters.category).toBe('');
      expect(component.applyFilters).toHaveBeenCalled();
    });

    it('should handle null category by setting empty string', () => {
      spyOn(component, 'applyFilters');
      component.filters.category = 'Fruits';
      component.onCategoryChange();

      categorySubject.next(null as any);

      expect(component.filters.category).toBe('');
      expect(component.applyFilters).toHaveBeenCalled();
    });
  });

  describe('onFilterChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should subscribe to filterService.currentFilter$', () => {
      const initialSubscriptionCount = component['subscriptions'].length;

      component.onFilterChange();

      expect(component['subscriptions'].length).toBe(
        initialSubscriptionCount + 1
      );
    });

    it('should update filters when filter changes', () => {
      component.onFilterChange();
      const testFilter: Filter = {
        category: 'Nuts and Seeds',
        calc_level: 'High',
      };

      filterSubject.next(testFilter);

      expect(component.filters).toEqual(testFilter);
    });

    it('should create a new filter object (not reference)', () => {
      component.onFilterChange();
      const testFilter: Filter = {
        category: 'Dairy',
        calc_level: 'Low',
        level: 3,
      };

      filterSubject.next(testFilter);

      expect(component.filters).toEqual(testFilter);
      expect(component.filters).not.toBe(testFilter);
    });

    it('should handle filters with optional properties', () => {
      component.onFilterChange();
      const testFilter: Filter = {
        category: 'Vegetables',
        calc_level: 'Medium',
        level: 4,
        item: 'Carrots',
      };

      filterSubject.next(testFilter);

      expect(component.filters).toEqual(testFilter);
      expect(component.filters.level).toBe(4);
      expect(component.filters.item).toBe('Carrots');
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call filterService.updateFilter with current filters', () => {
      component.filters = { category: 'Vegetables', calc_level: 'Low' };

      component.applyFilters();

      expect(filterService.updateFilter).toHaveBeenCalledWith(
        component.filters
      );
    });

    it('should emit filterChanged event with current filters', () => {
      spyOn(component.filterChanged, 'emit');
      component.filters = { category: 'Fruits', calc_level: 'High' };

      component.applyFilters();

      expect(component.filterChanged.emit).toHaveBeenCalledWith(
        component.filters
      );
    });

    it('should call both updateFilter and emit in correct order', () => {
      const emitSpy = spyOn(component.filterChanged, 'emit');
      component.filters = { category: 'Dairy', calc_level: 'Medium' };

      component.applyFilters();

      expect(filterService.updateFilter).toHaveBeenCalledBefore(emitSpy);
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should work with empty filters', () => {
      spyOn(component.filterChanged, 'emit');
      component.filters = { category: '', calc_level: '' };

      component.applyFilters();

      expect(filterService.updateFilter).toHaveBeenCalledWith({
        category: '',
        calc_level: '',
      });
      expect(component.filterChanged.emit).toHaveBeenCalledWith({
        category: '',
        calc_level: '',
      });
    });

    it('should handle filters with all optional properties', () => {
      spyOn(component.filterChanged, 'emit');
      const fullFilter: Filter = {
        category: 'Meats, Poultry, and Seafood',
        calc_level: 'Very High',
        level: 6,
        item: 'Chicken',
      };
      component.filters = fullFilter;

      component.applyFilters();

      expect(filterService.updateFilter).toHaveBeenCalledWith(fullFilter);
      expect(component.filterChanged.emit).toHaveBeenCalledWith(fullFilter);
    });
  });

  describe('clearFilters', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reset filters to default values', () => {
      component.filters = {
        category: 'Dairy',
        calc_level: 'Medium',
        level: 3,
        item: 'Milk',
      };

      component.clearFilters();

      expect(component.filters).toEqual({ category: '', calc_level: '' });
    });

    it('should call filterService.clearAll', () => {
      component.clearFilters();

      expect(filterService.clearAll).toHaveBeenCalledTimes(1);
    });

    it('should call categoryService.clearAll', () => {
      component.clearFilters();

      expect(categoryService.clearAll).toHaveBeenCalledTimes(1);
    });

    it('should emit filterChanged with cleared filters', () => {
      spyOn(component.filterChanged, 'emit');

      component.clearFilters();

      expect(component.filterChanged.emit).toHaveBeenCalledWith({
        category: '',
        calc_level: '',
      });
    });

    it('should call all clear methods and emit in correct order', () => {
      const emitSpy = spyOn(component.filterChanged, 'emit');

      component.clearFilters();

      expect(filterService.clearAll).toHaveBeenCalledBefore(emitSpy);
      expect(categoryService.clearAll).toHaveBeenCalledBefore(emitSpy);
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should work when filters are already empty', () => {
      component.filters = { category: '', calc_level: '' };
      spyOn(component.filterChanged, 'emit');

      component.clearFilters();

      expect(component.filters).toEqual({ category: '', calc_level: '' });
      expect(filterService.clearAll).toHaveBeenCalled();
      expect(categoryService.clearAll).toHaveBeenCalled();
      expect(component.filterChanged.emit).toHaveBeenCalled();
    });

    it('should not preserve optional filter properties', () => {
      component.filters = {
        category: 'Grains and Grain Products',
        calc_level: 'Low',
        level: 2,
        item: 'Rice',
      };

      component.clearFilters();

      expect(component.filters.level).toBeUndefined();
      expect(component.filters.item).toBeUndefined();
    });
  });

  describe('ngOnDestroy', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should unsubscribe from all subscriptions', () => {
      const subscriptions = component['subscriptions'];
      const unsubscribeSpies = subscriptions.map((sub) =>
        spyOn(sub, 'unsubscribe')
      );

      component.ngOnDestroy();

      unsubscribeSpies.forEach((spy) => {
        expect(spy).toHaveBeenCalled();
      });
    });

    it('should handle empty subscriptions array', () => {
      component['subscriptions'] = [];

      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should close all subscriptions', () => {
      component.ngOnDestroy();

      component['subscriptions'].forEach((sub) => {
        expect(sub.closed).toBeTrue();
      });
    });

    it('should unsubscribe in order', () => {
      const subscriptions = component['subscriptions'];
      let unsubscribeOrder: number[] = [];

      subscriptions.forEach((sub, index) => {
        const originalUnsubscribe = sub.unsubscribe.bind(sub);
        spyOn(sub, 'unsubscribe').and.callFake(() => {
          unsubscribeOrder.push(index);
          originalUnsubscribe();
        });
      });

      component.ngOnDestroy();

      expect(unsubscribeOrder).toEqual([0, 1, 2]);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete filter workflow', () => {
      fixture.detectChanges();
      spyOn(component.filterChanged, 'emit');

      // Category changes
      categorySubject.next('Fruits');
      expect(component.filters.category).toBe('Fruits');
      expect(filterService.updateFilter).toHaveBeenCalled();

      // Apply additional filter
      component.filters.calc_level = 'High';
      component.applyFilters();
      expect(component.filterChanged.emit).toHaveBeenCalledWith({
        category: 'Fruits',
        calc_level: 'High',
      });

      // Clear all
      component.clearFilters();
      expect(component.filters).toEqual({ category: '', calc_level: '' });
    });

    it('should handle rapid category changes', () => {
      fixture.detectChanges();
      spyOn(component, 'applyFilters');

      categorySubject.next('Fruits');
      categorySubject.next('Vegetables');
      categorySubject.next('Dairy');

      expect(component.filters.category).toBe('Dairy');
      expect(component.applyFilters).toHaveBeenCalledTimes(3);
    });

    it('should maintain filter state through multiple operations', () => {
      fixture.detectChanges();

      component.filters = {
        category: 'Nuts and Seeds',
        calc_level: 'Very High',
      };
      component.applyFilters();

      const newFilter: Filter = {
        category: 'Nuts and Seeds',
        calc_level: 'Very High',
        level: 6,
      };
      filterSubject.next(newFilter);

      expect(component.filters).toEqual(newFilter);
    });
  });

  describe('Theme Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update isDarkTheme on theme service changes', () => {
      themeSubject.next(true);
      expect(component.isDarkTheme).toBeTrue();

      themeSubject.next(false);
      expect(component.isDarkTheme).toBeFalse();
    });

    it('should handle multiple theme toggles', () => {
      themeSubject.next(true);
      themeSubject.next(false);
      themeSubject.next(true);
      themeSubject.next(false);

      expect(component.isDarkTheme).toBeFalse();
    });
  });
});
