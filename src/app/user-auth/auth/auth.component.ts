import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../service/auth-service.service';
import { AlertService } from 'src/app/shared/alert-service/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit, OnDestroy {
  authForm!: FormGroup;
  isSignInMode = true;
  showAlert: boolean = false;
  alertMessage: string = '';
  private alertSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupAlertSubscription();
  }

  ngOnDestroy(): void {
    if (this.alertSubscription) {
      this.alertSubscription.unsubscribe();
    }
  }

  initializeForm(): void {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: [''], // Only needed in sign-up mode
    });

    if (!this.isSignInMode) {
      this.authForm.controls['confirmPassword'].setValidators(
        Validators.required
      );
    } else {
      this.authForm.controls['confirmPassword'].clearValidators();
    }

    this.authForm.controls['confirmPassword'].updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    const { email, password, confirmPassword } = this.authForm.value;

    try {
      if (this.isSignInMode) {
        await this.authService.signIn(email, password);
      } else {
        if (password !== confirmPassword) {
          this.alertService.showAlert('Passwords do not match');
          return;
        }
        await this.authService.signUp(email, password, confirmPassword);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  }

  toggleAuthMode(): void {
    this.isSignInMode = !this.isSignInMode;
    this.initializeForm();
  }

  onGoogleSignIn(): void {
    this.authService.googleSignIn();
  }

  setupAlertSubscription(): void {
    this.alertSubscription = this.alertService
      .getAlertObservable()
      .subscribe((message) => {
        this.alertMessage = message.message;
        this.showAlert = !!message;
      });
  }
}
