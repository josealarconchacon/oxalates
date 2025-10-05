import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { BenefitsComponent } from './benefits.component';
import { BenefitsService, Benefit } from './service/benefits.service';

describe('BenefitsComponent', () => {
  let component: BenefitsComponent;
  let fixture: ComponentFixture<BenefitsComponent>;
  let benefitsService: jasmine.SpyObj<BenefitsService>;

  beforeEach(async () => {
    const benefitsServiceSpy = jasmine.createSpyObj('BenefitsService', [
      'getBenefits',
    ]);

    await TestBed.configureTestingModule({
      declarations: [BenefitsComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: BenefitsService, useValue: benefitsServiceSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BenefitsComponent);
    component = fixture.componentInstance;
    benefitsService = TestBed.inject(
      BenefitsService
    ) as jasmine.SpyObj<BenefitsService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty benefits array', () => {
    expect(component.benefits).toEqual([]);
  });

  it('should load benefits on init', () => {
    benefitsService.getBenefits.and.returnValue(of({ benefits: mockBenefits }));
    component.ngOnInit();
    expect(benefitsService.getBenefits).toHaveBeenCalled();
    expect(component.benefits).toEqual(mockBenefits);
    expect(component.benefits.length).toBe(3);
  });

  it('should handle empty benefits data', () => {
    benefitsService.getBenefits.and.returnValue(of({ benefits: [] }));
    component.ngOnInit();
    expect(component.benefits).toEqual([]);
    expect(component.benefits.length).toBe(0);
  });

  it('should handle service error gracefully', () => {
    benefitsService.getBenefits.and.returnValue(
      throwError(() => new Error('Network error'))
    );
    spyOn(console, 'error');
    component.ngOnInit();
    expect(component.benefits).toEqual([]);
  });

  it('should correctly map benefit properties', () => {
    benefitsService.getBenefits.and.returnValue(of({ benefits: mockBenefits }));
    component.ngOnInit();
    expect(component.benefits[0].icon).toBe('icon1.svg');
    expect(component.benefits[0].title).toBe('Better Health');
    expect(component.benefits[0].description).toBe(
      'Improve your overall health'
    );
  });
});

const mockBenefits: Benefit[] = [
  {
    icon: 'icon1.svg',
    title: 'Better Health',
    description: 'Improve your overall health',
  },
  {
    icon: 'icon2.svg',
    title: 'Weight Loss',
    description: 'Achieve your weight goals',
  },
  {
    icon: 'icon3.svg',
    title: 'More Energy',
    description: 'Feel energized throughout the day',
  },
];
