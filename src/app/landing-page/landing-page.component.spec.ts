import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;
  let mockActivatedRoute;

  beforeEach(async () => {
    mockActivatedRoute = {
      queryParams: of({ showOxalate: 'true' }),
    };

    await TestBed.configureTestingModule({
      declarations: [LandingPageComponent],
      providers: [{ provide: ActivatedRoute, useValue: mockActivatedRoute }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Query Parameter', () => {
    it('should set showOxalateComponent to true when showOxalate query param is present', () => {
      expect(component.showOxalateComponent).toBeTrue();
    });

    it('should call scrollToOxalate when showOxalate query param is present', () => {
      spyOn(component, 'scrollToOxalate');
      component.ngOnInit();
      expect(component.scrollToOxalate).toHaveBeenCalled();
    });
  });

  describe('onRegister', () => {
    it('should log "Register button clicked" when onRegister is called', () => {
      spyOn(console, 'log');
      component.onRegister();
      expect(console.log).toHaveBeenCalledWith('Register button clicked');
    });
  });

  describe('scrollToOxalate', () => {
    it('should scroll to the oxalate component when scrollToOxalate is called', (done) => {
      spyOn(document, 'querySelector').and.returnValue(mockElement as any);

      component.scrollToOxalate();

      setTimeout(() => {
        expect(document.querySelector).toHaveBeenCalledWith('app-oxalate');
        expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
        });
        done();
      }, 0);
    });
  });
});

const mockElement = {
  scrollIntoView: jasmine.createSpy('scrollIntoView'),
};
