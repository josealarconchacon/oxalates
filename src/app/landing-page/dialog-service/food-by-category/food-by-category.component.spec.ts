import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { FoodByCategoryComponent } from './food-by-category.component';
import { CategoryCard } from '../../model/category-card';
import { CategoryService } from '../oxalate/service/category.service';
import { FilterService } from '../oxalate/service/filter.service';
import { provideRouter } from '@angular/router';

describe('FoodByCategoryComponent', () => {
  let component: FoodByCategoryComponent;
  let fixture: ComponentFixture<FoodByCategoryComponent>;
  let httpMock: HttpTestingController;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let filterService: jasmine.SpyObj<FilterService>;
  let consoleWarnSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(async () => {
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', [
      'changeCategory',
    ]);
    const filterServiceSpy = jasmine.createSpyObj('FilterService', [
      'updateFilter',
    ]);

    await TestBed.configureTestingModule({
      imports: [FoodByCategoryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: FilterService, useValue: filterServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodByCategoryComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    categoryService = TestBed.inject(
      CategoryService
    ) as jasmine.SpyObj<CategoryService>;
    filterService = TestBed.inject(
      FilterService
    ) as jasmine.SpyObj<FilterService>;
    consoleWarnSpy = spyOn(console, 'warn');
    consoleErrorSpy = spyOn(console, 'error');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize cardsMap as empty Map', () => {
    expect(component.cardsMap).toBeInstanceOf(Map);
    expect(component.cardsMap.size).toBe(0);
  });

  it('should load cards on init', () => {
    component.ngOnInit();

    const req = httpMock.expectOne(
      '../../../../assets/mock-oxalate/food-by-catejory.json'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockCards);

    expect(component.cardsMap.size).toBe(3);
    expect(component.cardsMap.get('Fruits')).toEqual(mockCards[0]);
  });

  it('should handle error when loading cards', () => {
    component.ngOnInit();

    const req = httpMock.expectOne(
      '../../../../assets/mock-oxalate/food-by-catejory.json'
    );
    req.error(new ErrorEvent('Network error'));

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error loading category data:',
      jasmine.any(Object)
    );
  });

  it('should populate cardsMap from data', () => {
    component.populateCardsMap(mockCards);

    expect(component.cardsMap.size).toBe(3);
    expect(component.cardsMap.get('Fruits')).toEqual(mockCards[0]);
    expect(component.cardsMap.get('Vegetables')).toEqual(mockCards[1]);
    expect(component.cardsMap.get('Meat')).toEqual(mockCards[2]);
  });

  it('should skip cards without title when populating cardsMap', () => {
    const cardsWithoutTitle = [
      ...mockCards,
      { title: '', overlayText: '' } as CategoryCard,
    ];

    component.populateCardsMap(cardsWithoutTitle);

    expect(component.cardsMap.size).toBe(3);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Card without a title found and skipped:',
      jasmine.any(Object)
    );
  });

  it('should return cards as array', () => {
    component.populateCardsMap(mockCards);
    const cardsArray = component.cardsArray;

    expect(cardsArray.length).toBe(3);
    expect(cardsArray).toContain(mockCards[0]);
    expect(cardsArray).toContain(mockCards[1]);
    expect(cardsArray).toContain(mockCards[2]);
  });

  it('sets the search filters when a card is chosen', () => {
    component.selectCategory('Fruits');

    expect(categoryService.changeCategory).toHaveBeenCalledWith('Fruits');
    expect(filterService.updateFilter).toHaveBeenCalledWith({
      category: 'Fruits',
      calc_level: '',
    });
  });

  it('gives each category its icon and tint, and a leaf for unknown ones', () => {
    expect(component.styleFor('Fruits')).toEqual({
      icon: 'apple',
      tint: 'tint-rose',
    });
    expect(component.styleFor('Nuts and Seeds')).toEqual({
      icon: 'nut',
      tint: 'tint-brown',
    });
    expect(component.styleFor('Something New')).toEqual({
      icon: 'leaf',
      tint: 'tint-green',
    });
  });

  it('should unsubscribe on destroy', () => {
    component.ngOnInit();

    const req = httpMock.expectOne(
      '../../../../assets/mock-oxalate/food-by-catejory.json'
    );
    req.flush(mockCards);

    const subscription = component['subscriptions'][0];
    spyOn(subscription, 'unsubscribe');

    component.ngOnDestroy();

    expect(subscription.unsubscribe).toHaveBeenCalled();
  });
});

const mockCards: CategoryCard[] = [
  { title: 'Fruits', overlayText: '' },
  { title: 'Vegetables', overlayText: '' },
  { title: 'Meat', overlayText: '' },
];
