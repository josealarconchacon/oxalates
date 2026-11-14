import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { ColorSketchModule } from 'ngx-color/sketch';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CoverColorDialogComponent } from './cover-color-dialog/cover-color-dialog.component';
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
      declarations: [
        ProfileComponent,
        ChangePasswordComponent,
        SaveItemsComponent,
        CoverColorDialogComponent,
      ],
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        ReactiveFormsModule,
        A11yModule,
        ColorSketchModule,
        ClickableDirective,
        AlertComponent,
        IconComponent,
      ],
      providers: [provideRouter([]), provideNoopAnimations()],
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
      component.saveColor('#17603F');
      expect(component.currentHeaderColor).toBe('#17603F');
      expect(localStorage.getItem('headerColor')).toBe('#17603F');
      expect(component.bannerIsDark).toBeTrue();
    });

    it('goes back to the theme default when the default swatch is saved', () => {
      localStorage.setItem('headerColor', '#17603F');
      component.currentHeaderColor = '#17603F';
      component.bannerIsDark = true;

      component.saveColor('#EAEFE9');

      expect(component.currentHeaderColor).toBeNull();
      expect(component.bannerIsDark).toBeFalse();
      expect(localStorage.getItem('headerColor')).toBeNull();
    });
  });

  describe('Choose Color dialog', () => {
    afterEach(() => localStorage.removeItem('headerColor'));
    const dialog = () =>
      fixture.nativeElement.querySelector('app-cover-color-dialog');

    it('opens from the palette button and closes on Cancel without saving', () => {
      fixture.nativeElement.querySelector('.color-picker-toggle').click();
      fixture.detectChanges();
      expect(dialog()).not.toBeNull();

      dialog().querySelector('.cc-btn--cancel').click();
      fixture.detectChanges();
      expect(component.isColorPickerVisible).toBeFalse();
      expect(localStorage.getItem('headerColor')).toBeNull();
    });

    it('passes the saved color in, and Save stores the pick', () => {
      component.currentHeaderColor = '#4267B2';
      component.toggleColorPicker();
      fixture.detectChanges();
      const blue = dialog().querySelector('[aria-label="Blue"]');
      expect(blue.getAttribute('aria-selected')).toBe('true');

      dialog().querySelector('[aria-label="Purple"]').click();
      dialog().querySelector('.cc-btn--save').click();
      fixture.detectChanges();
      expect(component.currentHeaderColor).toBe('#9B59B6');
      expect(component.isColorPickerVisible).toBeFalse();
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

    it('lists Name and Email as a dl (term + value pairs)', () => {
      const terms = [...el().querySelectorAll('.details dt')].map((d) => d.textContent!.trim());
      expect(terms).toEqual(['Name', 'Email']);
      expect(el().querySelectorAll('.details dd').length).toBe(2);
    });

    it('Change Password opens the dialog and uses the key icon', () => {
      const btn = el().querySelector<HTMLButtonElement>('.edit-button')!;
      expect(btn.textContent!.trim()).toBe('Change Password');
      expect(btn.querySelector('app-icon')).not.toBeNull();
      btn.click();
      expect(component.isChangePasswordVisible).toBeTrue();
    });

    it('no longer has its own theme button (the header has one)', () => {
      expect(el().querySelector('.theme-toggle')).toBeNull();
    });
  });
});

