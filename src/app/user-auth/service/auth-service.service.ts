import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    });
  }

  async signUp(email: string, password: string): Promise<void> {
    try {
      await this.afAuth.createUserWithEmailAndPassword(email, password);
      this.router.navigate(['/profile']);
    } catch (error) {
      console.error('Error during sign up:', error);
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      this.router.navigate(['/profile']);
    } catch (error) {
      console.error('Error during sign in:', error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.afAuth.signOut();
      localStorage.removeItem('user');
      this.router.navigate(['/auth']);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  }

  getCurrentUser() {
    return this.afAuth.authState;
  }

  async googleSignIn(): Promise<void> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await this.afAuth.signInWithPopup(provider);
      this.router.navigate(['/oxalate']);
    } catch (error) {
      console.error('Error during Google sign-in:', error);
    }
  }

  async facebookSignIn(): Promise<void> {
    try {
      const provider = new firebase.auth.FacebookAuthProvider();
      await this.afAuth.signInWithPopup(provider);
      this.router.navigate(['/oxalate']);
    } catch (error) {
      console.error('Error during Facebook sign-in:', error);
    }
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('user') !== null;
  }
}
