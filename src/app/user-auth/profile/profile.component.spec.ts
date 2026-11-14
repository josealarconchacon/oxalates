import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ColorSketchModule } from 'ngx-color/sketch';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { SaveItemsComponent } from './save-items/save-items.component';
import { ClickableDirective } from 'src/app/shared/directives/clickable.directive';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { AlertComponent } from 'src/app/landing-page/dialog-service/oxalate/shared/alert/alert.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // The page and the pieces its template renders (the same set as ProfileModule)
      declarations: [ProfileComponent, ChangePasswordComponent, SaveItemsComponent],
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        ReactiveFormsModule,
        ColorSketchModule,
        ClickableDirective,
        AlertComponent,
        IconComponent,
      ],
      providers: [provideRouter([])],
    });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('splitEmail', () => {
    it('splits just before the @', () => {
      expect(component.splitEmail('jose.chacon@gmail.com')).toEqual({
        name: 'jose.chacon',
        domain: '@gmail.com',
      });
    });

    it('keeps text without an @ whole', () => {
      expect(component.splitEmail('username')).toEqual({
        name: 'username',
        domain: '',
      });
    });

    it('shows the same address in the card', () => {
      component.userProfile = { email: 'jose.chacon@gmail.com' };
      fixture.detectChanges();
      const span = fixture.nativeElement.querySelector('.profile-email span');
      expect(span.textContent.trim()).toBe('jose.chacon@gmail.com');
      expect(span.querySelector('wbr')).toBeTruthy();
    });
  });

  describe('banner color', () => {
    afterEach(() => localStorage.removeItem('headerColor'));

    it('saves a picked color', () => {
      component.selectedColor = '#17603F';
      component.saveColor();
      expect(component.currentHeaderColor).toBe('#17603F');
      expect(localStorage.getItem('headerColor')).toBe('#17603F');
      expect(component.bannerIsDark).toBeTrue();
    });

    it('goes back to the theme default when the default swatch is saved', () => {
      localStorage.setItem('headerColor', '#17603F');
      component.currentHeaderColor = '#17603F';
      component.bannerIsDark = true;

      component.onColorSelect('#EAEFE9');
      component.saveColor();

      expect(component.currentHeaderColor).toBeNull();
      expect(component.bannerIsDark).toBeFalse();
      expect(localStorage.getItem('headerColor')).toBeNull();
    });
  });

  describe('profile card labels', () => {
    const label = (sel: string) =>
      (fixture.nativeElement.querySelector(sel) as HTMLElement).getAttribute(
        'aria-label'
      );

    it('names the cover and photo buttons by what they change', () => {
      expect(label('.color-picker-toggle')).toBe('Change cover color');
      expect(label('.edit-avatar')).toBe('Change profile photo');
    });
  });

  describe('Profile Information card', () => {
    beforeEach(() => {
      (component as any).activeSection$ = of('profile');
      fixture.detectChanges();
    });
    const el = () => fixture.nativeElement as HTMLElement;

    it('is one card with the heading, details and Change Password', () => {
      const panel = el().querySelector('.info-panel')!;
      expect(panel.querySelector('h2')!.textContent!.trim()).toBe('Profile Information');
      expect(panel.textContent).toContain('Change Password');
      expect(el().querySelectorAll('.info-panel').length).toBe(1);
    });

    it('no longer has its own theme button (the header has one)', () => {
      expect(el().querySelector('.theme-toggle')).toBeNull();
    });
  });
});

