import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../service/auth-service.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  authForm!: FormGroup;
  isSignInMode = true;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: [''], // Only needed in sign-up mode
    });
  }

  async onSubmit(): Promise<void> {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    const { email, password, confirmPassword } = this.authForm.value;
    if (this.isSignInMode) {
      await this.authService.signIn(email, password);
    } else {
      if (password !== confirmPassword) {
        console.error('Passwords do not match');
        return;
      }
      await this.authService.signUp(email, password);
    }
  }

  toggleAuthMode(): void {
    this.isSignInMode = !this.isSignInMode;
    this.initializeForm();
  }

  onGoogleSignIn(): void {
    this.authService.googleSignIn();
  }

  onFacebookSignIn(): void {
    this.authService.facebookSignIn();
  }
}
