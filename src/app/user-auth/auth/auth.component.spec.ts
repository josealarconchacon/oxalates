import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { AuthService } from '../service/auth-service.service';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // A stand-in, so submitting the form never reaches real Firebase.
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'signIn',
      'signUp',
      'googleSignIn',
    ]);
    authService.signIn.and.resolveTo();
    authService.signUp.and.resolveTo();

    TestBed.configureTestingModule({
      declarations: [AuthComponent],
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        ReactiveFormsModule,
      ],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sign-in mode', () => {
    beforeEach(() => {
      component.authForm.setValue({
        email: 'person@example.com',
        password: 'any-old-password',
        confirmPassword: '',
      });
    });

    it('is valid with just an email and password (there is no confirm box)', () => {
      expect(component.isSignInMode).toBeTrue();
      expect(component.authForm.valid).toBeTrue();
    });

    it('signs in when submitted', async () => {
      await component.onSubmit();
      expect(authService.signIn).toHaveBeenCalledOnceWith(
        'person@example.com',
        'any-old-password'
      );
    });
  });

  describe('sign-up mode', () => {
    beforeEach(() => component.toggleAuthMode());

    it('is invalid while the two passwords differ', () => {
      component.authForm.setValue({
        email: 'person@example.com',
        password: 'Str0ng!Passw0rd',
        confirmPassword: 'Different!123A',
      });
      expect(component.authForm.hasError('passwordMismatch')).toBeTrue();
      expect(component.authForm.valid).toBeFalse();
    });

    it('is valid once a strong password is confirmed', () => {
      component.authForm.setValue({
        email: 'person@example.com',
        password: 'Str0ng!Passw0rd',
        confirmPassword: 'Str0ng!Passw0rd',
      });
      expect(component.authForm.valid).toBeTrue();
    });
  });
});
