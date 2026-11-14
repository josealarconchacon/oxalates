import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment';
import { provideRouter } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../service/auth-service.service';
import { A11yModule } from '@angular/cdk/a11y';
import { ColorPickerComponent } from './cover-color-dialog/color-picker/color-picker.component';
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
        FormsModule,
        ReactiveFormsModule,
        A11yModule,
        ColorPickerComponent,
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
      expect(blue.getAttribute('aria-checked')).toBe('true');

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

  describe('edit name', () => {
    let auth: AuthService;
    const el = () => fixture.nativeElement as HTMLElement;
    const pencil = () => el().querySelector<HTMLButtonElement>('.edit-name');
    const input = () => el().querySelector<HTMLInputElement>('.name-input');
    const typeName = async (value: string) => {
      input()!.value = value;
      input()!.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
    };
    const submit = async () => {
      el().querySelector<HTMLFormElement>('.name-form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
      fixture.detectChanges();
    };

    beforeEach(() => {
      auth = TestBed.inject(AuthService);
      (component as any).activeSection$ = of('profile');
      component.userProfile = { displayName: 'Ana', email: 'ana@example.com' };
      fixture.detectChanges();
    });

    it('shows the name with a labelled pencil button', () => {
      expect(el().querySelector('.name-value')!.textContent!.trim()).toBe('Ana');
      expect(pencil()!.getAttribute('aria-label')).toBe('Edit name');
    });

    it('the pencil opens a field with the current name, focused and labelled "Name"', () => {
      pencil()!.click();
      fixture.detectChanges();
      expect(input()!.value).toBe('Ana');
      expect(document.activeElement).toBe(input());
      const labelId = input()!.getAttribute('aria-labelledby')!;
      expect(el().querySelector('#' + labelId)!.textContent!.trim()).toBe('Name');
      expect(input()!.maxLength).toBe(50);
    });

    it('Save sends the name to the service and closes the field', async () => {
      const save = spyOn(auth, 'updateDisplayName').and.resolveTo('Ana Ruiz');
      pencil()!.click();
      fixture.detectChanges();
      await typeName('Ana Ruiz');
      await submit();
      expect(save).toHaveBeenCalledWith('Ana Ruiz');
      expect(input()).toBeNull();
      expect(document.activeElement).toBe(pencil());
    });

    it('an empty name shows an error and does not save', async () => {
      const save = spyOn(auth, 'updateDisplayName');
      pencil()!.click();
      fixture.detectChanges();
      await typeName('   ');
      await submit();
      expect(save).not.toHaveBeenCalled();
      expect(el().querySelector('.name-error')!.textContent!.trim()).toBe('Please enter a name.');
      expect(input()!.getAttribute('aria-invalid')).toBe('true');
      expect(input()!.getAttribute('aria-describedby')).toBe('profile-name-error');

      await typeName('A'); // typing again clears the old error
      expect(el().querySelector('.name-error')).toBeNull();
      expect(input()!.hasAttribute('aria-invalid')).toBeFalse();
    });

    it('a failed save keeps the field open with a message', async () => {
      spyOn(auth, 'updateDisplayName').and.rejectWith(new Error('offline'));
      pencil()!.click();
      fixture.detectChanges();
      await typeName('Ana Ruiz');
      await submit();
      expect(input()).not.toBeNull();
      expect(el().querySelector('.name-error')!.textContent!.trim()).toBe(
        "Couldn't save your name. Please try again."
      );
    });

    it('Esc cancels without saving and returns focus to the pencil', async () => {
      const save = spyOn(auth, 'updateDisplayName');
      pencil()!.click();
      fixture.detectChanges();
      await typeName('Something else');
      input()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(save).not.toHaveBeenCalled();
      expect(input()).toBeNull();
      expect(el().querySelector('.name-value')!.textContent!.trim()).toBe('Ana');
      expect(document.activeElement).toBe(pencil());
    });
  });
});
