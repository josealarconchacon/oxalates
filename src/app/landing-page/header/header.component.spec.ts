import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

class MockAuthService {
  userProfile$ = of<null | {}>(null);
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let router: Router;
  let authService: MockAuthService;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatIconModule],
      declarations: [HeaderComponent],
      providers: [{ provide: AuthService, useClass: MockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleNav', () => {
    it('should toggle isNavOpen when toggleNav is called', () => {
      expect(component.isNavOpen).toBeFalse();
      component.toggleNav();
      expect(component.isNavOpen).toBeTrue();
      component.toggleNav();
      expect(component.isNavOpen).toBeFalse();
    });
  });

  describe('search', () => {
    it('should call router navigate when search is called', () => {
      const navigateSpy = spyOn(router, 'navigate').and.callThrough();
      component.search();
      expect(navigateSpy).toHaveBeenCalledWith(['/oxalate']);
    });
  });

  describe('goToLandingPage', () => {
    it('should call router navigate with query params when goToLandingPage is called', () => {
      const navigateSpy = spyOn(router, 'navigate').and.callThrough();
      component.goToLandingPage();
      expect(navigateSpy).toHaveBeenCalledWith(['/'], {
        queryParams: { scrollTo: 'top' },
      });
    });
  });

  describe('goToProfile', () => {
    it('should navigate to /profile if the user is logged in', () => {
      authService.userProfile$ = of({});
      component.ngOnInit();
      const navigateSpy = spyOn(router, 'navigate');
      component.goToProfile();
      expect(navigateSpy).toHaveBeenCalledWith(['/profile']);
    });

    it('should navigate to /auth if the user is not logged in', () => {
      authService.userProfile$ = of(null);
      component.ngOnInit();
      const navigateSpy = spyOn(router, 'navigate');
      component.goToProfile();
      expect(navigateSpy).toHaveBeenCalledWith(['/auth']);
    });
  });
});
