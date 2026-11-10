import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ManagingOxalateComponent } from './managing-oxalate.component';
import { OxalateService } from './service/oxalate.service';
import { of, throwError } from 'rxjs';

describe('ManagingOxalateComponent', () => {
  let component: ManagingOxalateComponent;
  let fixture: ComponentFixture<ManagingOxalateComponent>;
  let mockOxalateService: jasmine.SpyObj<OxalateService>;

  beforeEach(async () => {
    mockOxalateService = jasmine.createSpyObj('OxalateService', [
      'getOxalateContent',
    ]);
    mockOxalateService.getOxalateContent.and.returnValue(
      of(JSON.parse(JSON.stringify(mockData)))
    );

    await TestBed.configureTestingModule({
      declarations: [ManagingOxalateComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OxalateService, useValue: mockOxalateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagingOxalateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getOxalateContent on service', () => {
      fixture.detectChanges();
      expect(mockOxalateService.getOxalateContent).toHaveBeenCalled();
    });

    it('should initialize content with data from service', () => {
      fixture.detectChanges();
      expect(component.content).toBeDefined();
      expect(component.content?.title).toBe('Tips for Managing Oxalate Intake');
    });

    it('should add Community Support as 6th tip', () => {
      fixture.detectChanges();
      expect(component.content?.tips.length).toBe(6);
      const communitySupportTip = component.content?.tips[5];
      expect(communitySupportTip).toBeDefined();

      if (communitySupportTip) {
        expect(communitySupportTip.title).toBe('Community Support');
      }
    });

    it('should use communitySupport data for Community Support tip description', () => {
      fixture.detectChanges();
      const communitySupportTip = component.content?.tips.find(
        (tip) => tip.title === 'Community Support'
      );
      expect(communitySupportTip).toBeDefined();
      if (communitySupportTip) {
        expect(communitySupportTip.description).toBe(
          'Join the Trying Low Oxalates (TLO) community on Facebook to get support with your journey.'
        );
      }
    });

    it('should handle null or undefined data', () => {
      mockOxalateService.getOxalateContent.and.returnValue(of(null));
      fixture.detectChanges();
      expect(component.content).toBeNull();
    });

    it('should handle data without tips property', () => {
      mockOxalateService.getOxalateContent.and.returnValue(of(dataWithoutTips));
      fixture.detectChanges();
      expect(component.content).toBeDefined();
      expect(component.content?.tips).toBeUndefined();
    });

    it('should handle service error gracefully', () => {
      mockOxalateService.getOxalateContent.and.returnValue(
        throwError(() => new Error('Service error'))
      );

      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('card icons and numbers', () => {
    it('gives each tip its line icon', () => {
      expect(component.lineIconFor('Stay Hydrated')).toBe('droplet');
      expect(component.lineIconFor('Mineral Intake')).toBe('gem');
      expect(component.lineIconFor('Go Slowly')).toBe('gauge');
      expect(component.lineIconFor('Regular Monitoring')).toBe('clipboard-list');
      expect(component.lineIconFor('Consultation')).toBe('user');
      expect(component.lineIconFor('Community Support')).toBe('users');
    });

    it('falls back to a leaf for a tip it does not know', () => {
      expect(component.lineIconFor('Some New Tip')).toBe('leaf');
    });

    it('numbers the cards 01, 02, …', () => {
      expect(component.cardNumber(0)).toBe('01');
      expect(component.cardNumber(5)).toBe('06');
      expect(component.cardNumber(11)).toBe('12');
    });
  });

  describe('Content Structure', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should preserve original tip descriptions', () => {
      const stayHydratedTip = component.content?.tips.find(
        (t) => t.title === 'Stay Hydrated'
      );
      expect(stayHydratedTip?.description).toContain('8-10 glasses of water');
    });

    it('should preserve title and link from service data', () => {
      expect(component.content?.title).toBe('Tips for Managing Oxalate Intake');
      expect(component.content?.link).toBe(
        'https://www.facebook.com/groups/135981539816730'
      );
    });

    it('should have all tips with required properties', () => {
      component.content?.tips.forEach((tip) => {
        expect(tip.title).toBeDefined();
        expect(tip.description).toBeDefined();
      });
    });
  });

  describe('Component Initialization', () => {
    it('should have content as null before ngOnInit', () => {
      expect(component.content).toBeNull();
    });

    it('should have OxalateService injected', () => {
      expect(component['oxalateService']).toBe(mockOxalateService);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tips array', () => {
      mockOxalateService.getOxalateContent.and.returnValue(
        of(dataWithEmptyTips)
      );
      fixture.detectChanges();
      expect(component.content?.tips.length).toBe(1);
      expect(component.content?.tips[0].title).toBe('Community Support');
    });

    it('should not add Community Support if tips property is missing', () => {
      mockOxalateService.getOxalateContent.and.returnValue(
        of(dataWithoutTipsTest)
      );
      fixture.detectChanges();
      expect(component.content?.tips).toBeUndefined();
    });
  });
});

const mockData = {
  title: 'Tips for Managing Oxalate Intake',
  tips: [
    {
      title: 'Stay Hydrated',
      description:
        'Drink at least 8-10 glasses of water daily to help dilute oxalates in your urine.',
    },
    {
      title: 'Mineral Intake',
      description:
        'Pair high-oxalate foods with mineral-rich foods or supplements like dairy or magnesium to reduce absorption.',
    },
    {
      title: 'Go Slowly',
      description:
        'Reduce oxalate by no more than 10% per week to minimize the risks of oxalate dumping.',
    },
    {
      title: 'Regular Monitoring',
      description:
        'Keep a food diary to track oxalate intake and identify triggers.',
    },
    {
      title: 'Consultation',
      description:
        'Consider consulting a dietitian that is well-versed in low-oxalate diets to receive tailored dietary recommendations that suit your individual needs.',
    },
  ],
  communitySupport:
    'Join the Trying Low Oxalates (TLO) community on Facebook to get support with your journey.',
  link: 'https://www.facebook.com/groups/135981539816730',
};

const dataWithoutTips = {
  title: 'Tips for Managing Oxalate Intake',
  link: 'https://example.com',
  communitySupport: 'Join our community',
};

const dataWithEmptyTips = {
  ...mockData,
  tips: [],
};

const dataWithoutTipsTest = {
  title: 'Test Title',
  link: 'https://test.com',
  communitySupport: 'Test support',
};
