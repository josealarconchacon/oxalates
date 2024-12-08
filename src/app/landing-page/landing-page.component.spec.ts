import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandingPageComponent],
      providers: [
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
      TestBed.configureTestingModule({
        declarations: [LandingPageComponent],
        providers: [
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
      TestBed.configureTestingModule({
        declarations: [LandingPageComponent],
        providers: [
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
    it('should scroll to the app-oxalate element smoothly', fakeAsync(() => {
      const mockElement = document.createElement('div');
      mockElement.scrollIntoView = jasmine.createSpy('scrollIntoView');
      spyOn(document, 'querySelector').and.returnValue(mockElement);

      component.scrollToOxalate();
      tick();

      expect(document.querySelector).toHaveBeenCalledWith('app-oxalate');
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
      });
    }));

    it('should not throw an error if the app-oxalate element does not exist', fakeAsync(() => {
      spyOn(document, 'querySelector').and.returnValue(null);

      expect(() => {
        component.scrollToOxalate();
        tick();
      }).not.toThrow();
    }));
  });
});
