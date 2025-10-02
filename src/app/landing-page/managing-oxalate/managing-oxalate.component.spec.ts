import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ManagingOxalateComponent } from './managing-oxalate.component';
import { OxalateService } from './service/oxalate.service';
import { of, throwError } from 'rxjs';

fdescribe('ManagingOxalateComponent', () => {
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
      imports: [HttpClientTestingModule],
      providers: [{ provide: OxalateService, useValue: mockOxalateService }],
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

    it('should add icons and iconClass to existing tips', () => {
      fixture.detectChanges();
      const stayHydratedTip = component.content?.tips.find(
        (tip) => tip.title === 'Stay Hydrated'
      );
      expect(stayHydratedTip?.icon).toBe('water_drop');
      expect(stayHydratedTip?.iconClass).toBe('icon-water');

      const goSlowlyTip = component.content?.tips.find(
        (tip) => tip.title === 'Go Slowly'
      );
      expect(goSlowlyTip?.icon).toBe('speed');
      expect(goSlowlyTip?.iconClass).toBe('icon-speed');
    });

    it('should add Community Support as 6th tip', () => {
      fixture.detectChanges();
      expect(component.content?.tips.length).toBe(6);
      const communitySupportTip = component.content?.tips[5];
      expect(communitySupportTip).toBeDefined();

      if (communitySupportTip) {
        expect(communitySupportTip.title).toBe('Community Support');
        expect(communitySupportTip.icon).toBe('group');
        expect(communitySupportTip.iconClass).toBe('icon-community');
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

  describe('Tip Icon Mapping', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should map Stay Hydrated with water icon', () => {
      const tip = component.content?.tips.find(
        (t) => t.title === 'Stay Hydrated'
      );
      expect(tip?.icon).toBe('water_drop');
      expect(tip?.iconClass).toBe('icon-water');
    });

    it('should map Mineral Intake with default icon when not in mapping', () => {
      const tip = component.content?.tips.find(
        (t) => t.title === 'Mineral Intake'
      );
      expect(tip?.icon).toBe('tips_and_updates');
      expect(tip?.iconClass).toBe('icon-default');
    });

    it('should map Go Slowly with speed icon', () => {
      const tip = component.content?.tips.find((t) => t.title === 'Go Slowly');
      expect(tip?.icon).toBe('speed');
      expect(tip?.iconClass).toBe('icon-speed');
    });

    it('should map Regular Monitoring with monitoring icon', () => {
      const tip = component.content?.tips.find(
        (t) => t.title === 'Regular Monitoring'
      );
      expect(tip?.icon).toBe('monitoring');
      expect(tip?.iconClass).toBe('icon-monitoring');
    });

    it('should map Consultation with person icon', () => {
      const tip = component.content?.tips.find(
        (t) => t.title === 'Consultation'
      );
      expect(tip?.icon).toBe('person');
      expect(tip?.iconClass).toBe('icon-consultation');
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
        expect(tip.icon).toBeDefined();
        expect(tip.iconClass).toBeDefined();
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
