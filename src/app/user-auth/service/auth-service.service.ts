import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { UserProfile } from '../profile/model/user-profile';
import { AlertService } from 'src/app/shared/alert-service/alert.service';
import { isStrongPassword } from 'src/app/shared/utils/password-validator';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  [x: string]: any;
  private userProfileSubject = new BehaviorSubject<any>(null);
  userProfile$: Observable<any> = this.userProfileSubject.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private alertService: AlertService
  ) {
    this.initAuthListener();
  }

  private initAuthListener(): void {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.getUserData(user.uid).then((userData) => {
          this.setUserProfile(userData);
        });
      } else {
        this.setUserProfile(null);
      }
    });
  }

  async signUp(
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<void> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if the email is valid
    if (!emailRegex.test(email)) {
      this.alertService.showAlert('Please enter a valid email address.');
      return;
    }

    try {
      // Create a new user with the email and password
      const result = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );

      await result.user?.sendEmailVerification();

      this.alertService.showAlert(
        'A verification email has been sent. Please verify your email before logging in.'
      );

      await this.updateUserData(result.user);

      this.router.navigate(['/verification-pending']);
    } catch (error: any) {
      console.error('Error during sign-up:', error);

      switch (error.code) {
        case 'auth/email-already-in-use':
          this.alertService.showAlert(
            'This email is already in use. Please try logging in.'
          );
          break;
        case 'auth/weak-password':
          this.alertService.showAlert(
            'The password is too weak. Please choose a stronger password.'
          );
          break;
        case 'auth/invalid-email':
          this.alertService.showAlert('The email address is badly formatted.');
          break;
        case 'auth/operation-not-allowed':
          this.alertService.showAlert(
            'Email/password sign-up is disabled. Please contact support.'
          );
          break;
        case 'auth/too-many-requests':
          this.alertService.showAlert(
            'Too many requests. Please try again later.'
          );
          break;
        default:
          this.alertService.showAlert(
            'Sign-up failed. Please check your input and try again.'
          );
          break;
      }
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );
      if (!result.user?.emailVerified) {
        this.alertService.showAlert(
          'Please verify your email before logging in.'
        );
        return;
      }
      await this.updateUserData(result.user);
      this.router.navigate(['/oxalate']);
    } catch (error: any) {
      console.error('Error during sign-in:', error);

      switch (error.code) {
        case 'auth/user-not-found':
          this.alertService.showAlert(
            'No account found for this email. Please sign up first.'
          );
          break;
        case 'auth/wrong-password':
          this.alertService.showAlert('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          this.alertService.showAlert('The email address is badly formatted.');
          break;
        case 'auth/user-disabled':
          this.alertService.showAlert(
            'This account has been disabled. Please contact support.'
          );
          break;
        case 'auth/too-many-requests':
          this.alertService.showAlert(
            'Too many unsuccessful login attempts. Please try again later.'
          );
          break;
        case 'auth/invalid-credential':
          this.alertService.showAlert(
            'Invalid credentials. Please try logging in again or contact support.'
          );
          break;
        default:
          this.alertService.showAlert(
            'Login failed. Please check your credentials and try again.'
          );
          break;
      }
    }
  }

  async googleSignIn(): Promise<void> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await this.afAuth.signInWithPopup(provider);
      await this.updateUserData(result.user);
      this.router.navigate(['/oxalate']);
    } catch (error: any) {
      console.error('Error during Google sign-in:', error);

      // Handle specific errors
      switch (error.code) {
        case 'auth/account-exists-with-different-credential':
          this.alertService.showAlert(
            'An account already exists with this email using a different sign-in method.'
          );
          break;
        case 'auth/cancelled-popup-request':
          this.alertService.showAlert('Sign-in request was cancelled.');
          break;
        default:
          this.alertService.showAlert('Failed to sign in with Google.');
          break;
      }
    }
  }

  isAuthenticated(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user !== null;
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

  private async getUserData(uid: string): Promise<UserProfile | null> {
    const userRef = this.afs.collection('users').doc(uid);
    const userData = await userRef.get().toPromise();

    if (userData?.exists) {
      const data = userData.data() as UserProfile;
      if (!data.photoURL) {
        const user = await this.afAuth.currentUser;
        if (user && user.photoURL) {
          data.photoURL = user.photoURL;
        }
      }
      return data;
    }
    return null;
  }

  private updateUserData(user: firebase.User | null): Promise<void> {
    if (!user) return Promise.resolve();

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      profileImage: user.photoURL || '',
      lastLogin: new Date(),
    };

    if (!user.uid || !user.email) {
      console.error('Invalid user data:', userData);
      return Promise.reject(new Error('Invalid user data'));
    }

    const userRef = this.afs.collection('users').doc(user.uid);
    return userRef.set(userData, { merge: true });
  }

  setUserProfile(profile: any) {
    if (profile) {
      localStorage.setItem('user', JSON.stringify(profile));
    } else {
      localStorage.removeItem('user');
    }
    this.userProfileSubject.next(profile);
  }
  getUserProfile(): Observable<any> {
    const storedUser = localStorage.getItem('user');
    if (storedUser && !this.userProfileSubject.value) {
      this.setUserProfile(JSON.parse(storedUser));
    }
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
        const credential = firebase.auth.EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPassword);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<firebase.User | null> {
    const user = await this.afAuth.currentUser;
    return user ?? null;
  }

  redirectToSignIn(): void {
    this.router.navigate(['/auth']);
  }

  async updateProfileImage(imageUrl: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (user) {
      const userRef = this.afs.collection('users').doc(user.uid);
      await userRef.update({ photoURL: imageUrl });
      await user.updateProfile({ photoURL: imageUrl });

      const updatedProfile = {
        ...this.userProfileSubject.value,
        photoURL: imageUrl,
      };
      this.setUserProfile(updatedProfile);
    }
  }
}
