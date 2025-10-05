import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, BehaviorSubject } from 'rxjs';

import { FoodByCategoryComponent } from './food-by-category.component';
import { CategoryCard } from '../../model/category-card';
import { CategoryService } from '../oxalate/service/category.service';
import { FilterService } from '../oxalate/service/filter.service';
import { SvgService } from './service/svg.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { Router } from '@angular/router';

describe('FoodByCategoryComponent', () => {
  let component: FoodByCategoryComponent;
  let fixture: ComponentFixture<FoodByCategoryComponent>;
  let httpMock: HttpTestingController;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let filterService: jasmine.SpyObj<FilterService>;
  let router: jasmine.SpyObj<Router>;
  let svgService: jasmine.SpyObj<SvgService>;
  let themeService: jasmine.SpyObj<ThemeService>;
  let consoleWarnSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;
  let isDarkThemeSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    isDarkThemeSubject = new BehaviorSubject<boolean>(false);

    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', [
      'changeCategory',
    ]);
    const filterServiceSpy = jasmine.createSpyObj('FilterService', [
      'updateFilter',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const svgServiceSpy = jasmine.createSpyObj('SvgService', [
      'sanitizeAndPrepareSvg',
    ]);
    const themeServiceSpy = jasmine.createSpyObj('ThemeService', [], {
      isDarkTheme$: isDarkThemeSubject.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [
        FoodByCategoryComponent,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: FilterService, useValue: filterServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: SvgService, useValue: svgServiceSpy },
        { provide: ThemeService, useValue: themeServiceSpy },
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
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    svgService = TestBed.inject(SvgService) as jasmine.SpyObj<SvgService>;
    themeService = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;

    svgService.sanitizeAndPrepareSvg.and.returnValue('<svg>sanitized</svg>');
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
      { title: '', iconSvg: '<svg></svg>', overlayText: '' } as CategoryCard,
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

  it('should validate SVGs correctly in development', () => {
    spyOn<any>(component, 'isProduction').and.returnValue(false);
    component.populateCardsMap(mockCards);
    component.validateSvgs();

    expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    expect(consoleWarnSpy.calls.argsFor(0)).toEqual([
      'Missing SVG for category: Vegetables',
    ]);
    expect(consoleWarnSpy.calls.argsFor(1)).toEqual([
      'Invalid SVG format for category: Meat',
    ]);
  });

  it('should not validate SVGs in production', () => {
    spyOn<any>(component, 'isProduction').and.returnValue(true);
    component.populateCardsMap(mockCards);
    component.validateSvgs();

    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should validate SVG format correctly', () => {
    expect(component.isSvgValid('<svg></svg>')).toBeTrue();
    expect(component.isSvgValid('<svg>content</svg>')).toBeTrue();
    expect(component.isSvgValid('invalid-svg')).toBeFalse();
    expect(component.isSvgValid('<svg>missing closing tag')).toBeFalse();
    expect(component.isSvgValid('missing opening tag</svg>')).toBeFalse();
  });

  it('should navigate to /oxalate on card click with valid category', () => {
    component.populateCardsMap(mockCards);
    component.onCardClick('Fruits');

    expect(categoryService.changeCategory).toHaveBeenCalledWith('Fruits');
    expect(filterService.updateFilter).toHaveBeenCalledWith({
      category: 'Fruits',
      calc_level: '',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/oxalate'], {
      queryParams: {
        category: 'Fruits',
      },
    });
  });

  it('should warn when clicking on non-existent category', () => {
    component.populateCardsMap(mockCards);
    component.onCardClick('NonExistent');

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Category "NonExistent" not found in cardsMap.'
    );
    expect(categoryService.changeCategory).not.toHaveBeenCalled();
    expect(filterService.updateFilter).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should sanitize and prepare SVG', () => {
    const result = component.getSanitizedIcon('<svg>...</svg>');

    expect(svgService.sanitizeAndPrepareSvg).toHaveBeenCalledWith(
      '<svg>...</svg>'
    );
    expect(result).toBe('<svg>sanitized</svg>');
  });

  it('should expose isDarkTheme$ from ThemeService', () => {
    expect(component.isDarkTheme$).toBe(themeService.isDarkTheme$);
  });

  it('should detect production environment correctly', () => {
    expect(component['isProduction']('localhost')).toBeFalse();
    expect(component['isProduction']('127.0.0.1')).toBeFalse();
    expect(component['isProduction']('dev.127.0.0.1')).toBeFalse();
    expect(component['isProduction']('example.com')).toBeTrue();
    expect(component['isProduction']('www.myapp.com')).toBeTrue();
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
  {
    title: 'Fruits',
    iconSvg: '<svg>...</svg>',
    overlayText: '',
  },
  { title: 'Vegetables', iconSvg: '', overlayText: '' },
  { title: 'Meat', iconSvg: 'invalid-svg', overlayText: '' },
];
