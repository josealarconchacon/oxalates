import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { BehaviorSubject, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userProfileSubject = new BehaviorSubject<any>(null);
  userProfile$: Observable<any> = this.userProfileSubject.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
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
      console.error('Sign-up failed.');
      alert('Sign-up failed. Please try again.');
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );
      await this.updateUserData(result.user);
      this.router.navigate(['/oxalate']);
    } catch (error) {
      console.error('Error during sign in');
      alert('Login failed. Please check your credentials.');
    }
  }

  async googleSignIn(): Promise<void> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await this.afAuth.signInWithPopup(provider);
      await this.updateUserData(result.user);
      this.router.navigate(['/oxalate']);
    } catch (error) {
      console.error('Error during Google sign-in:', error);
    }
  }

  async facebookSignIn(): Promise<void> {
    try {
      const provider = new firebase.auth.FacebookAuthProvider();
      const result = await this.afAuth.signInWithPopup(provider);
      await this.updateUserData(result.user);
      this.router.navigate(['/oxalate']);
    } catch (error) {
      console.error('Error during Facebook sign-in:', error);
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

  private async getUserData(uid: string): Promise<any> {
    const userRef = this.afs.collection('users').doc(uid);
    const userData = await userRef.get().toPromise();
    return userData?.data();
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

      const currentProfile = await this.getUserData(user.uid);
      const updatedProfile = { ...currentProfile, photoURL: imageUrl };
      this.setUserProfile(updatedProfile);
    }
  }
}
