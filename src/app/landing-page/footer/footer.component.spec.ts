import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { Router, NavigationEnd } from '@angular/router';
import { of, Subject } from 'rxjs';
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
      declarations: [],
      imports: [FooterComponent, MatIconModule, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AuthMessageService, useValue: authMessageServiceSpy },
      ],
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
