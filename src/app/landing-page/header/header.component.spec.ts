import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ProfileImageService } from 'src/app/user-auth/service/profile-image.service';

class MockAuthService {
  userProfile$ = of<null | {}>(null);
}

describe('HeaderComponent', () => {
  let profileImageService: { upload: jasmine.Spy };
  let component: HeaderComponent;
  let router: Router;
  let authService: MockAuthService;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(() => {
    profileImageService = {
      upload: jasmine.createSpy('upload').and.resolveTo(true),
    };

    TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule, MatIconModule],
      declarations: [],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: ProfileImageService, useValue: profileImageService },
      ],
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

  describe('onProfileImageChange', () => {
    const changeEventWith = (files: File[]) => {
      const input = document.createElement('input');
      input.type = 'file';
      if (files.length) {
        const transfer = new DataTransfer();
        files.forEach((file) => transfer.items.add(file));
        input.files = transfer.files;
      }
      return { input, event: { target: input } as unknown as Event };
    };

    it('hands the chosen photo to the profile image service', async () => {
      const file = new File(['pixels'], 'me.png', { type: 'image/png' });
      const { event } = changeEventWith([file]);

      await component.onProfileImageChange(event);

      expect(profileImageService.upload).toHaveBeenCalledOnceWith(file);
    });

    it('clears the input so the same photo can be chosen again', async () => {
      const file = new File(['pixels'], 'me.png', { type: 'image/png' });
      const { input, event } = changeEventWith([file]);

      await component.onProfileImageChange(event);

      expect(input.files?.length).toBe(0);
    });

    it('does nothing when no file was chosen', async () => {
      const { event } = changeEventWith([]);

      await component.onProfileImageChange(event);

      expect(profileImageService.upload).not.toHaveBeenCalled();
    });
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
