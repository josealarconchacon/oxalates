import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false; // Replace this with actual authentication logic

  constructor(private router: Router) {}

  checkAuth(): boolean {
    return this.isAuthenticated;
  }

  // Method to navigate to sign-in page
  redirectToSignIn(): void {
    this.router.navigate(['/auth']);
  }

  // Method to simulate user sign-in
  signIn(): void {
    this.isAuthenticated = true; // Set authentication status
  }

  signOut(): void {
    this.isAuthenticated = false; // Clear authentication status
    this.router.navigate(['/']); // Navigate to home or another appropriate page
  }
}
