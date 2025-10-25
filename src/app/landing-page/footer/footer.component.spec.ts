import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../../user-auth/service/auth-service.service';
import { AuthMessageService } from '../../shared/services/auth-message.service';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let routerEvents$: Subject<any>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let authMessageService: jasmine.SpyObj<AuthMessageService>;

  beforeEach(async () => {
    routerEvents$ = new Subject<any>();
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: routerEvents$.asObservable(),
    });
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
    ]);
    const authMessageServiceSpy = jasmine.createSpyObj('AuthMessageService', [
      'showAuthMessage',
    ]);

    await TestBed.configureTestingModule({
      imports: [FooterComponent, MatIconModule, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AuthMessageService, useValue: authMessageServiceSpy },
      ],
    })
      .overrideComponent(FooterComponent, {
        remove: {
          providers: [AuthService],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authMessageService = TestBed.inject(
      AuthMessageService
    ) as jasmine.SpyObj<AuthMessageService>;

    fixture.detectChanges();
  });

  afterEach(() => {
    routerEvents$.complete();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have showBackToHome as false by default', () => {
      expect(component.showBackToHome).toBe(false);
    });

    it('should inject Router', () => {
      expect(router).toBeTruthy();
    });

    it('should inject AuthService', () => {
      expect(authService).toBeTruthy();
    });

    it('should inject AuthMessageService', () => {
      expect(authMessageService).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    it('should subscribe to router events', () => {
      expect(component['routerSubscription']).toBeDefined();
    });

    it('should set showBackToHome to true when current URL is /oxalate', () => {
      routerEvents$.next(new NavigationEnd(1, '/oxalate', '/oxalate'));
      expect(component.showBackToHome).toBeTrue();
    });

    it('should set showBackToHome to false when current URL is not /oxalate', () => {
      routerEvents$.next(new NavigationEnd(1, '/other', '/other'));
      expect(component.showBackToHome).toBeFalse();
    });

    it('should set showBackToHome to false for root URL', () => {
      routerEvents$.next(new NavigationEnd(1, '/', '/'));
      expect(component.showBackToHome).toBeFalse();
    });

    it('should set showBackToHome to false for /oxalate with query params', () => {
      routerEvents$.next(
        new NavigationEnd(1, '/oxalate?search=test', '/oxalate?search=test')
      );
      expect(component.showBackToHome).toBeFalse();
    });

    it('should handle multiple NavigationEnd events', () => {
      routerEvents$.next(new NavigationEnd(1, '/oxalate', '/oxalate'));
      expect(component.showBackToHome).toBeTrue();

      routerEvents$.next(new NavigationEnd(2, '/other', '/other'));
      expect(component.showBackToHome).toBeFalse();

      routerEvents$.next(new NavigationEnd(3, '/oxalate', '/oxalate'));
      expect(component.showBackToHome).toBeTrue();
    });

    it('should only respond to NavigationEnd events', () => {
      routerEvents$.next({ type: 'NavigationStart' });
      expect(component.showBackToHome).toBeFalse();

      routerEvents$.next(new NavigationEnd(1, '/oxalate', '/oxalate'));
      expect(component.showBackToHome).toBeTrue();
    });
  });

  describe('search', () => {
    it('should call router.navigate with correct route when search is called', () => {
      component.search();
      expect(router.navigate).toHaveBeenCalledWith(['/oxalate']);
    });

    it('should call router.navigate exactly once', () => {
      component.search();
      expect(router.navigate).toHaveBeenCalledTimes(1);
    });

    it('should be callable multiple times', () => {
      component.search();
      component.search();
      expect(router.navigate).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledWith(['/oxalate']);
    });
  });

  describe('navigateToCalculateDailyIntake', () => {
    it('should navigate to /food-entry when user is authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);

      component.navigateToCalculateDailyIntake();

      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/food-entry']);
      expect(authMessageService.showAuthMessage).not.toHaveBeenCalled();
    });

    it('should show auth message when user is not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);

      component.navigateToCalculateDailyIntake();

      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(authMessageService.showAuthMessage).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should check authentication status before navigation', () => {
      authService.isAuthenticated.and.returnValue(true);

      component.navigateToCalculateDailyIntake();

      expect(authService.isAuthenticated).toHaveBeenCalledTimes(1);
    });
  });

  describe('navigateToSuggestions', () => {
    it('should navigate to /suggestions when called', () => {
      component.navigateToSuggestions();

      expect(router.navigate).toHaveBeenCalledWith(['/suggestions']);
    });

    it('should call router.navigate exactly once', () => {
      component.navigateToSuggestions();

      expect(router.navigate).toHaveBeenCalledTimes(1);
    });

    it('should be callable multiple times', () => {
      component.navigateToSuggestions();
      component.navigateToSuggestions();

      expect(router.navigate).toHaveBeenCalledTimes(2);
      expect(router.navigate).toHaveBeenCalledWith(['/suggestions']);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from router events', () => {
      const spy = spyOn(component['routerSubscription'], 'unsubscribe');
      component.ngOnDestroy();
      expect(spy).toHaveBeenCalled();
    });

    it('should call unsubscribe exactly once', () => {
      const spy = spyOn(component['routerSubscription'], 'unsubscribe');
      component.ngOnDestroy();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not throw error if subscription is undefined', () => {
      component['routerSubscription'] = undefined as any;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should handle multiple calls to ngOnDestroy', () => {
      const spy = spyOn(component['routerSubscription'], 'unsubscribe');
      component.ngOnDestroy();
      component.ngOnDestroy();
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete navigation flow', () => {
      // Navigate to oxalate page
      routerEvents$.next(new NavigationEnd(1, '/oxalate', '/oxalate'));
      expect(component.showBackToHome).toBeTrue();

      // Search, should navigate to oxalate again
      component.search();
      expect(router.navigate).toHaveBeenCalledWith(['/oxalate']);

      // Navigate away
      routerEvents$.next(new NavigationEnd(2, '/other', '/other'));
      expect(component.showBackToHome).toBeFalse();
    });

    it('should handle authentication flow for calculate daily intake', () => {
      authService.isAuthenticated.and.returnValue(false);
      component.navigateToCalculateDailyIntake();
      expect(authMessageService.showAuthMessage).toHaveBeenCalled();

      authService.isAuthenticated.and.returnValue(true);
      component.navigateToCalculateDailyIntake();
      expect(router.navigate).toHaveBeenCalledWith(['/food-entry']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle URL with trailing slash', () => {
      routerEvents$.next(new NavigationEnd(1, '/oxalate/', '/oxalate/'));
      expect(component.showBackToHome).toBeFalse();
    });

    it('should handle case-sensitive URL comparison', () => {
      routerEvents$.next(new NavigationEnd(1, '/Oxalate', '/Oxalate'));
      expect(component.showBackToHome).toBeFalse();
    });

    it('should handle URL with fragment', () => {
      routerEvents$.next(
        new NavigationEnd(1, '/oxalate#section', '/oxalate#section')
      );
      expect(component.showBackToHome).toBeFalse();
    });

    it('should handle nested oxalate routes', () => {
      routerEvents$.next(
        new NavigationEnd(1, '/oxalate/details', '/oxalate/details')
      );
      expect(component.showBackToHome).toBeFalse();
    });
  });
});
