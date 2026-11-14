import {
  EnvironmentInjector,
  Injectable,
  runInInjectionContext,
} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { BehaviorSubject, Observable, firstValueFrom, map, take } from 'rxjs';
import { UserProfile } from '../profile/model/user-profile';
import { AlertService } from 'src/app/shared/alert-service/alert.service';
import { isStrongPassword } from 'src/app/shared/utils/password-validator';

/**
 * Set in sessionStorage just before a Google sign-in redirect, so the app only
 * asks Firebase for a redirect result on the page load that follows one.
 */
export const GOOGLE_REDIRECT_PENDING_KEY = 'googleRedirectPending';

/** The longest name someone can save on their profile. */
export const DISPLAY_NAME_MAX_LENGTH = 50;

/** Trims a typed name and squeezes runs of spaces into one. */
export function cleanDisplayName(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/** Why a (cleaned) name can't be saved, or null when it's fine. */
export function displayNameError(name: string): string | null {
  if (!name) return 'Please enter a name.';
  if (name.length > DISPLAY_NAME_MAX_LENGTH) {
    return `Use ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`;
  }
  return null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** Settles once a pending Google redirect sign-in has been handled. */
  readonly redirectSignInDone: Promise<void>;
  private userProfileSubject = new BehaviorSubject<any>(null);
  userProfile$: Observable<any> = this.userProfileSubject.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private alertService: AlertService,
    private injector: EnvironmentInjector
  ) {
    this.initAuthListener();
    this.redirectSignInDone = this.completeGoogleRedirectSignIn();
  }

  // AngularFire 19's compat classes call inject() when they are created, which only
  // works inside an injection context. These calls run from callbacks and after
  // awaits, so the reference is built inside runInInjectionContext.
  private usersDoc(uid: string) {
    return runInInjectionContext(this.injector, () =>
      this.afs.collection('users').doc(uid)
    );
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

      await this.updateUserData(result.user);
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
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          // Deliberately generic: surfacing "no account found" vs "wrong
          // password" separately would let an attacker enumerate which
          // emails have accounts.
          this.alertService.showAlert(
            'Invalid email or password. Please try again.'
          );
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
        default:
          this.alertService.showAlert(
            'Login failed. Please check your credentials and try again.'
          );
          break;
      }
    }
  }

  async googleSignIn(): Promise<void> {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await this.afAuth.signInWithPopup(provider);
      await this.updateUserData(result.user);
      this.router.navigate(['/oxalate']);
    } catch (error: any) {
      switch (error.code) {
        // The user closed the popup, or clicked again and a new popup replaced
        // this one. Neither is a failure, so there is nothing to report.
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
          return;
        // The browser blocked the popup (common on phones): sign in on a full
        // page instead. The result is picked up on the next page load.
        case 'auth/popup-blocked':
        case 'auth/operation-not-supported-in-this-environment':
          await this.googleSignInWithRedirect(provider);
          return;
        default:
          this.reportGoogleSignInError(error);
      }
    }
  }

  private async googleSignInWithRedirect(
    provider: firebase.auth.GoogleAuthProvider
  ): Promise<void> {
    sessionStorage.setItem(GOOGLE_REDIRECT_PENDING_KEY, '1');
    try {
      await this.afAuth.signInWithRedirect(provider);
    } catch (error) {
      sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY);
      this.reportGoogleSignInError(error);
    }
  }

  /** Finishes a Google sign-in that went through a redirect instead of a popup. */
  private async completeGoogleRedirectSignIn(): Promise<void> {
    if (!sessionStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY)) {
      return;
    }
    sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY);
    try {
      const result = await this.afAuth.getRedirectResult();
      if (result.user) {
        await this.updateUserData(result.user);
        this.router.navigate(['/oxalate']);
      }
    } catch (error) {
      this.reportGoogleSignInError(error);
    }
  }

  private reportGoogleSignInError(error: any): void {
    console.error('Error during Google sign-in:', error);
    if (error?.code === 'auth/account-exists-with-different-credential') {
      this.alertService.showAlert(
        'An account already exists with this email using a different sign-in method.'
      );
    } else {
      this.alertService.showAlert('Failed to sign in with Google.');
    }
  }

  isAuthenticated(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user !== null;
  }

  // Prefer this for route guards or anything else that's actually gating
  // access: it waits for Firebase's own rehydrated session state instead of
  // trusting the locally cached profile blob isAuthenticated() reads, which
  // stays present until the *next* authState emission even if the
  // underlying session has already expired or been revoked elsewhere.
  isAuthenticatedAsync(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      take(1),
      map((user) => !!user)
    );
  }

  /**
   * True once a user has a session *and* a verified email (Google accounts
   * always are). Email sign-ups that haven't verified yet stay signed in to
   * Firebase but should still see the sign-in page and its "verify" message.
   */
  isSignedInAndVerifiedAsync(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      take(1),
      map((user) => !!user && user.emailVerified)
    );
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
    const userRef = this.usersDoc(uid);
    const userData = await firstValueFrom(userRef.get());

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

    const userRef = this.usersDoc(user.uid);
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

  /**
   * Saves the name shown on the profile and returns it, cleaned up.
   *
   * It goes to the Auth profile first, then the users/{uid} document, then
   * the cached profile so the page updates at once. Auth comes first because
   * every login copies the Auth name into the document (updateUserData), so
   * the two can't drift apart for long even if the second write fails.
   */
  async updateDisplayName(input: string): Promise<string> {
    const name = cleanDisplayName(input);
    const error = displayNameError(name);
    if (error) throw new Error(error);

    const user = await this.getCurrentUser();
    if (!user) throw new Error('Please sign in again to change your name.');

    await user.updateProfile({ displayName: name });
    // set + merge also works for an account whose document is missing.
    await this.usersDoc(user.uid).set({ displayName: name }, { merge: true });

    this.setUserProfile({ ...this.userProfileSubject.value, displayName: name });
    return name;
  }

  async updateProfileImage(imageUrl: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (user) {
      const userRef = this.usersDoc(user.uid);
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
