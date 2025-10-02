import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { FoodByCategoryComponent } from './food-by-category.component';
import { CategoryCard } from '../../model/category-card';
import { CategoryService } from '../oxalate/service/category.service';
import { FilterService } from '../oxalate/service/filter.service';
import { SvgService } from './service/svg.service';
import { Router } from '@angular/router';

describe('FoodByCategoryComponent', () => {
  let component: FoodByCategoryComponent;
  let fixture: ComponentFixture<FoodByCategoryComponent>;
  let httpMock: HttpTestingController;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let filterService: jasmine.SpyObj<FilterService>;
  let router: jasmine.SpyObj<Router>;
  let svgService: jasmine.SpyObj<SvgService>;
  let consoleWarnSpy: jasmine.Spy;

  beforeEach(async () => {
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

    svgService.sanitizeAndPrepareSvg.and.returnValue('<svg>sanitized</svg>');
    consoleWarnSpy = spyOn(console, 'warn').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cards on init', () => {
    component.ngOnInit();
    const req = httpMock.expectOne(
      '../../../../assets/mock-oxalate/food-by-catejory.json'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockCards);

    // expect(component.cards).toEqual(mockCards);
  });

  it('should validate SVGs correctly', () => {
    // component.cards = mockCards;
    component.validateSvgs();
    expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    expect(consoleWarnSpy.calls.argsFor(0)).toEqual([
      'Missing SVG for category: Vegetables',
    ]);
    expect(consoleWarnSpy.calls.argsFor(1)).toEqual([
      'Invalid SVG format for category: Meat',
    ]);
  });

  it('should navigate to /oxalate on card click', () => {
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

  it('should sanitize and prepare SVG', () => {
    const result = component.getSanitizedIcon('<svg>...</svg>');

    expect(svgService.sanitizeAndPrepareSvg).toHaveBeenCalledWith(
      '<svg>...</svg>'
    );
    expect(result).toBe('<svg>sanitized</svg>');
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
