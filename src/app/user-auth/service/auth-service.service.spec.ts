import { EnvironmentInjector, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { AlertService } from 'src/app/shared/alert-service/alert.service';
import {
  AuthService,
  GOOGLE_REDIRECT_PENDING_KEY,
  cleanDisplayName,
  displayNameError,
} from './auth-service.service';

describe('AuthService Google sign-in', () => {
  const googleUser = {
    uid: 'user-1',
    email: 'person@example.com',
    displayName: 'Person',
    photoURL: '',
  };

  let afAuth: jasmine.SpyObj<any>;
  let router: jasmine.SpyObj<Router>;
  let alertService: jasmine.SpyObj<AlertService>;
  let savedUserDocs: unknown[];

  const authError = (code: string) => Object.assign(new Error(code), { code });

  function createService(): AuthService {
    return TestBed.inject(AuthService);
  }

  beforeEach(() => {
    sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY);
    savedUserDocs = [];

    afAuth = jasmine.createSpyObj(
      'AngularFireAuth',
      ['signInWithPopup', 'signInWithRedirect', 'getRedirectResult'],
      { authState: of(null) }
    );
    afAuth.signInWithRedirect.and.resolveTo();
    afAuth.getRedirectResult.and.resolveTo({ user: null });

    router = jasmine.createSpyObj('Router', ['navigate']);
    alertService = jasmine.createSpyObj('AlertService', ['showAlert']);

    // Like the real compat classes, these must be created in an injection context.
    const fakeFirestore = {
      collection: () => {
        inject(EnvironmentInjector);
        return {
          doc: () => {
            inject(EnvironmentInjector);
            return {
              set: (data: unknown) => {
                savedUserDocs.push(data);
                return Promise.resolve();
              },
            };
          },
        };
      },
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AngularFireAuth, useValue: afAuth },
        { provide: AngularFirestore, useValue: fakeFirestore },
        { provide: Router, useValue: router },
        { provide: AlertService, useValue: alertService },
      ],
    });
  });

  afterEach(() => sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY));

  describe('with the popup', () => {
    it('saves the user and opens the search page when sign-in succeeds', async () => {
      afAuth.signInWithPopup.and.resolveTo({ user: googleUser });

      await createService().googleSignIn();

      expect(savedUserDocs.length).toBe(1);
      expect(router.navigate).toHaveBeenCalledWith(['/oxalate']);
      expect(alertService.showAlert).not.toHaveBeenCalled();
    });

    it('stays quiet when the user closes the popup', async () => {
      afAuth.signInWithPopup.and.rejectWith(authError('auth/popup-closed-by-user'));

      await createService().googleSignIn();

      expect(alertService.showAlert).not.toHaveBeenCalled();
      expect(afAuth.signInWithRedirect).not.toHaveBeenCalled();
    });

    it('stays quiet when a second click replaces the first popup', async () => {
      afAuth.signInWithPopup.and.rejectWith(authError('auth/cancelled-popup-request'));

      await createService().googleSignIn();

      expect(alertService.showAlert).not.toHaveBeenCalled();
    });

    it('falls back to a full-page redirect when the browser blocks the popup', async () => {
      afAuth.signInWithPopup.and.rejectWith(authError('auth/popup-blocked'));

      await createService().googleSignIn();

      expect(afAuth.signInWithRedirect).toHaveBeenCalledTimes(1);
      expect(sessionStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY)).toBe('1');
      expect(alertService.showAlert).not.toHaveBeenCalled();
    });

    it('shows an alert when the redirect fallback itself fails', async () => {
      afAuth.signInWithPopup.and.rejectWith(authError('auth/popup-blocked'));
      afAuth.signInWithRedirect.and.rejectWith(authError('auth/network-request-failed'));

      await createService().googleSignIn();

      expect(sessionStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY)).toBeNull();
      expect(alertService.showAlert).toHaveBeenCalledWith('Failed to sign in with Google.');
    });

    it('still explains an account that uses another sign-in method', async () => {
      afAuth.signInWithPopup.and.rejectWith(
        authError('auth/account-exists-with-different-credential')
      );

      await createService().googleSignIn();

      expect(alertService.showAlert).toHaveBeenCalledWith(
        'An account already exists with this email using a different sign-in method.'
      );
    });

    it('shows a general alert for other errors', async () => {
      afAuth.signInWithPopup.and.rejectWith(authError('auth/network-request-failed'));

      await createService().googleSignIn();

      expect(alertService.showAlert).toHaveBeenCalledWith('Failed to sign in with Google.');
    });
  });

  describe('when the app loads', () => {
    it('does not ask Firebase for a redirect result unless a redirect was started', async () => {
      createService();
      await Promise.resolve();

      expect(afAuth.getRedirectResult).not.toHaveBeenCalled();
    });

    it('finishes a redirect sign-in: saves the user and opens the search page', async () => {
      sessionStorage.setItem(GOOGLE_REDIRECT_PENDING_KEY, '1');
      afAuth.getRedirectResult.and.resolveTo({ user: googleUser });

      await createService().redirectSignInDone;

      expect(sessionStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY)).toBeNull();
      expect(savedUserDocs.length).toBe(1);
      expect(router.navigate).toHaveBeenCalledWith(['/oxalate']);
    });

    it('shows an alert if the redirect sign-in failed', async () => {
      sessionStorage.setItem(GOOGLE_REDIRECT_PENDING_KEY, '1');
      afAuth.getRedirectResult.and.rejectWith(authError('auth/internal-error'));

      await createService().redirectSignInDone;

      expect(sessionStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY)).toBeNull();
      expect(alertService.showAlert).toHaveBeenCalledWith('Failed to sign in with Google.');
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});

describe('AuthService.isSignedInAndVerifiedAsync', () => {
  function serviceWith(user: { uid: string; emailVerified: boolean } | null) {
    const afAuth = jasmine.createSpyObj('AngularFireAuth', ['getRedirectResult'], {
      authState: of(user),
      currentUser: Promise.resolve(user),
    });
    afAuth.getRedirectResult.and.resolveTo({ user: null });

    // The service loads the profile on start-up; a missing doc is enough here.
    const fakeFirestore = {
      collection: () => {
        inject(EnvironmentInjector);
        return {
          doc: () => {
            inject(EnvironmentInjector);
            return { get: () => of({ exists: false }) };
          },
        };
      },
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AngularFireAuth, useValue: afAuth },
        { provide: AngularFirestore, useValue: fakeFirestore },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: AlertService, useValue: jasmine.createSpyObj('AlertService', ['showAlert']) },
      ],
    });
    return TestBed.inject(AuthService);
  }

  it('is true for a signed-in user with a verified email', async () => {
    const service = serviceWith({ uid: 'u1', emailVerified: true });
    expect(await firstValueFrom(service.isSignedInAndVerifiedAsync())).toBeTrue();
  });

  it('is false for a signed-in user who has not verified their email', async () => {
    const service = serviceWith({ uid: 'u1', emailVerified: false });
    expect(await firstValueFrom(service.isSignedInAndVerifiedAsync())).toBeFalse();
  });

  it('is false when nobody is signed in', async () => {
    const service = serviceWith(null);
    expect(await firstValueFrom(service.isSignedInAndVerifiedAsync())).toBeFalse();
  });
});

describe('display name rules', () => {
  it('trims and squeezes spaces', () => {
    expect(cleanDisplayName('  Ana   María  Ruiz ')).toBe('Ana María Ruiz');
  });

  it('needs at least one character', () => {
    expect(displayNameError('')).toBe('Please enter a name.');
  });

  it('allows up to 50 characters', () => {
    expect(displayNameError('a'.repeat(50))).toBeNull();
    expect(displayNameError('a'.repeat(51))).toBe('Use 50 characters or fewer.');
  });
});

describe('AuthService.updateDisplayName', () => {
  let user: { uid: string; updateProfile: jasmine.Spy } | null;
  let docWrites: { data: unknown; options: unknown }[];
  let failDocWrite: boolean;

  function createService(): AuthService {
    const afAuth = jasmine.createSpyObj('AngularFireAuth', ['getRedirectResult'], {
      authState: of(null), // don't load a profile on start-up
      currentUser: Promise.resolve(user),
    });
    afAuth.getRedirectResult.and.resolveTo({ user: null });

    const fakeFirestore = {
      collection: () => {
        inject(EnvironmentInjector);
        return {
          doc: () => {
            inject(EnvironmentInjector);
            return {
              set: (data: unknown, options: unknown) => {
                if (failDocWrite) return Promise.reject(new Error('offline'));
                docWrites.push({ data, options });
                return Promise.resolve();
              },
            };
          },
        };
      },
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AngularFireAuth, useValue: afAuth },
        { provide: AngularFirestore, useValue: fakeFirestore },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: AlertService, useValue: jasmine.createSpyObj('AlertService', ['showAlert']) },
      ],
    });
    return TestBed.inject(AuthService);
  }

  beforeEach(() => {
    user = { uid: 'u1', updateProfile: jasmine.createSpy('updateProfile').and.resolveTo() };
    docWrites = [];
    failDocWrite = false;
  });

  afterEach(() => localStorage.removeItem('user'));

  it('saves the cleaned name to Auth, the user document and the cached profile', async () => {
    const service = createService();
    service.setUserProfile({ uid: 'u1', email: 'a@b.com', displayName: '' });

    const saved = await service.updateDisplayName('  Ana  Ruiz ');

    expect(saved).toBe('Ana Ruiz');
    expect(user!.updateProfile).toHaveBeenCalledWith({ displayName: 'Ana Ruiz' });
    expect(docWrites).toEqual([{ data: { displayName: 'Ana Ruiz' }, options: { merge: true } }]);
    const profile = await firstValueFrom(service.userProfile$);
    expect(profile).toEqual({ uid: 'u1', email: 'a@b.com', displayName: 'Ana Ruiz' });
  });

  it('rejects an empty or too-long name without saving anything', async () => {
    const service = createService();
    await expectAsync(service.updateDisplayName('   ')).toBeRejectedWithError('Please enter a name.');
    await expectAsync(service.updateDisplayName('x'.repeat(51))).toBeRejectedWithError(
      'Use 50 characters or fewer.'
    );
    expect(user!.updateProfile).not.toHaveBeenCalled();
    expect(docWrites).toEqual([]);
  });

  it('asks to sign in again when nobody is signed in', async () => {
    user = null;
    const service = createService();
    await expectAsync(service.updateDisplayName('Ana')).toBeRejectedWithError(
      'Please sign in again to change your name.'
    );
  });

  it('leaves the cached profile alone when a save fails', async () => {
    failDocWrite = true;
    const service = createService();
    service.setUserProfile({ uid: 'u1', displayName: 'Old' });

    await expectAsync(service.updateDisplayName('New')).toBeRejected();

    const profile = await firstValueFrom(service.userProfile$);
    expect(profile.displayName).toBe('Old');
  });
});
