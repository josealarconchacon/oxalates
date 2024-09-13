import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { BehaviorSubject } from 'rxjs';

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
      await this.updateUserData(result.user); // Store user data in Firestore
      this.router.navigate(['/oxalate']);
    } catch (error) {
      console.error('Error during sign up:', error);
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );
      await this.updateUserData(result.user); // Store user data in Firestore
      this.router.navigate(['/oxalate']);
    } catch (error) {
      console.error('Error during sign in:', error);
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
        // Update the passwor
        await user.updatePassword(newPassword);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}
