import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ThemeService } from '../shared/services/theme.service';
import { OxalateService } from './dialog-service/service/oxalate.service';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;
  let mockOxalateService: jasmine.SpyObj<OxalateService>;

  beforeEach(() => {
    // Create mock OxalateService
    mockOxalateService = jasmine.createSpyObj('OxalateService', [
      'searchOxalateData',
    ]);
    mockOxalateService.searchOxalateData.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [LandingPageComponent],
      providers: [
        ThemeService,
        { provide: OxalateService, useValue: mockOxalateService },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ showOxalate: 'true' }),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('OnInit', () => {
    it('should initialize showOxalateComponent to false by default', () => {
      TestBed.resetTestingModule();

      const mockOxalateServiceLocal = jasmine.createSpyObj('OxalateService', [
        'searchOxalateData',
      ]);
      mockOxalateServiceLocal.searchOxalateData.and.returnValue(of([]));

      TestBed.configureTestingModule({
        declarations: [LandingPageComponent],
        providers: [
          ThemeService,
          { provide: OxalateService, useValue: mockOxalateServiceLocal },
          {
            provide: Router,
            useValue: {
              navigate: jasmine.createSpy('navigate'),
            },
          },
          {
            provide: ActivatedRoute,
            useValue: {
              queryParams: of({}),
            },
          },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();

      fixture = TestBed.createComponent(LandingPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.showOxalateComponent).toBeFalse();
    });

    it('should set showOxalateComponent to true when showOxalate query param is present', () => {
      TestBed.resetTestingModule();

      const mockOxalateServiceLocal = jasmine.createSpyObj('OxalateService', [
        'searchOxalateData',
      ]);
      mockOxalateServiceLocal.searchOxalateData.and.returnValue(of([]));

      TestBed.configureTestingModule({
        declarations: [LandingPageComponent],
        providers: [
          ThemeService,
          { provide: OxalateService, useValue: mockOxalateServiceLocal },
          {
            provide: Router,
            useValue: {
              navigate: jasmine.createSpy('navigate'),
            },
          },
          {
            provide: ActivatedRoute,
            useValue: {
              queryParams: of({ showOxalate: 'true' }),
            },
          },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();

      fixture = TestBed.createComponent(LandingPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.showOxalateComponent).toBeTrue();
    });
  });

  describe('onRegister', () => {
    it('should log "Register button clicked" when called', () => {
      spyOn(console, 'log');

      component.onRegister();

      expect(console.log).toHaveBeenCalledWith('Register button clicked');
    });
  });

  describe('scrollToOxalate', () => {
    it('should scroll to the app-oxalate element smoothly', (done) => {
      const mockElement = document.createElement('div');
      mockElement.scrollIntoView = jasmine.createSpy('scrollIntoView');
      spyOn(document, 'querySelector').and.returnValue(mockElement);

      component.scrollToOxalate();

      // Wait for requestAnimationFrame to complete
      requestAnimationFrame(() => {
        expect(document.querySelector).toHaveBeenCalledWith('app-oxalate');
        expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
        });
        done();
      });
    });

    it('should not throw an error if the app-oxalate element does not exist', (done) => {
      spyOn(document, 'querySelector').and.returnValue(null);

      expect(() => {
        component.scrollToOxalate();
      }).not.toThrow();

      requestAnimationFrame(() => {
        expect(document.querySelector).toHaveBeenCalledWith('app-oxalate');
        done();
      });
    });
  });
});
