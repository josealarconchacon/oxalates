import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  authForm!: FormGroup;
  isSignInMode = true; // Toggle between sign-in and sign-up modes

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  initializeForm() {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required], // Only needed in sign-up mode
    });
  }

  onSubmit(): void {
    if (this.authForm.valid) {
      if (this.isSignInMode) {
        // Perform sign-in logic
        console.log('Signing in with:', this.authForm.value);
      } else {
        // Perform sign-up logic
        console.log('Signing up with:', this.authForm.value);
      }
    } else {
      this.authForm.markAllAsTouched(); // Ensure all fields are validated
    }
  }

  toggleAuthMode(): void {
    this.isSignInMode = !this.isSignInMode;
    this.initializeForm(); // Reset the form on mode change
  }

  onGoogleSignIn() {
    // Handle Google Sign-In Logic here
    console.log('Google Sign-In clicked');
  }

  onFacebookSignIn() {
    // Handle Facebook Sign-In Logic here
    console.log('Facebook Sign-In clicked');
  }
}
