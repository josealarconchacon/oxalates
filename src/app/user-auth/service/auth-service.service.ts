import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { BehaviorSubject, first } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userProfileSubject = new BehaviorSubject<any>(null);
  userProfile$ = this.userProfileSubject.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore, // Inject AngularFirestore
    private router: Router
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        this.setUserProfile(user);
        this.updateUserData(user); // Ensure user data is updated in Firestore
      } else {
        localStorage.removeItem('user');
        this.setUserProfile(null);
      }
    });
  }

  async signUp(
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<void> {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      const result = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );
      await this.updateUserData(result.user);
      this.router.navigate(['/oxalate']);
    } catch (error) {
      console.error('Sign-up failed.'); // Avoid detailed logging
      alert('Sign-up failed. Please try again.');
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );
      await this.updateUserData(result.user); // Update user data
      this.router.navigate(['/oxalate']);
    } catch (error) {
      console.error('Error during sign in'); // Avoid logging sensitive error details
      // Display a user-friendly error message
      alert('Login failed. Please check your credentials.');
    }
  }

  async googleSignIn(): Promise<void> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await this.afAuth.signInWithPopup(provider);
      await this.updateUserData(result.user); // Store user data in Firestore
      this.router.navigate(['/oxalate']);
    } catch (error) {
      console.error('Error during Google sign-in:', error);
    }
  }

  async facebookSignIn(): Promise<void> {
    try {
      const provider = new firebase.auth.FacebookAuthProvider();
      const result = await this.afAuth.signInWithPopup(provider);
      await this.updateUserData(result.user); // Store user data in Firestore
      this.router.navigate(['/oxalate']);
    } catch (error) {
      console.error('Error during Facebook sign-in:', error);
    }
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('user') !== null;
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

  private updateUserData(user: firebase.User | null): Promise<void> {
    if (!user) return Promise.resolve();

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      lastLogin: new Date(),
    };

    // Validate data before setting in Firestore
    if (!user.uid || !user.email) {
      console.error('Invalid user data:', userData);
      return Promise.reject(new Error('Invalid user data'));
    }

    const userRef = this.afs.collection('users').doc(user.uid);
    return userRef.set(userData, { merge: true });
  }

  setUserProfile(profile: any) {
    this.userProfileSubject.next(profile);
  }

  getUserProfile() {
    return this.userProfile$;
  }

  logout() {
    this.userProfileSubject.next(null);
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await this.afAuth.currentUser;
      if (user && user.email) {
        // // Re-authenticate the user with the current password
        const credential = firebase.auth.EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await user.reauthenticateWithCredential(credential);
        // Update the password
        await user.updatePassword(newPassword);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<firebase.User | null> {
    const user = await this.afAuth.currentUser;
    return user ?? null; // Use null if user is undefined
  }

  redirectToSignIn(): void {
    this.router.navigate(['/auth']); // Redirect to the authentication page
  }
}
