import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { Router, NavigationEnd } from '@angular/router';
import { of, Subject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let routerEvents$: Subject<any>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerEvents$ = new Subject<any>();
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: routerEvents$.asObservable(),
    });

    await TestBed.configureTestingModule({
      declarations: [FooterComponent],
      imports: [MatIconModule, NoopAnimationsModule],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  afterEach(() => {
    routerEvents$.complete();
  });

  describe('ngOnInit', () => {
    it('should set showBackToHome to true when current URL is /oxalate', () => {
      routerEvents$.next(new NavigationEnd(1, '/oxalate', '/oxalate'));
      expect(component.showBackToHome).toBeTrue();
    });

    it('should set showBackToHome to false when current URL is not /oxalate', () => {
      routerEvents$.next(new NavigationEnd(1, '/other', '/other'));
      expect(component.showBackToHome).toBeFalse();
    });
  });

  describe('search', () => {
    it('should call router.navigate with correct route when search is called', () => {
      component.search();
      expect(router.navigate).toHaveBeenCalledWith(['/oxalate']);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from router events', () => {
      const spy = spyOn(component['routerSubscription'], 'unsubscribe');
      component.ngOnDestroy();
      expect(spy).toHaveBeenCalled();
    });
  });
});
