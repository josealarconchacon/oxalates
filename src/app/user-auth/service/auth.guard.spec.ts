import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { UrlTree } from '@angular/router';
import { AuthService } from './auth-service.service';
import { authGuard, signedOutGuard } from './auth.guard';

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;

  const runGuard = (isAuthenticated: boolean) => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { isAuthenticatedAsync: () => of(isAuthenticated) },
        },
        { provide: Router, useValue: router },
      ],
    });

    return firstValueFrom(
      TestBed.runInInjectionContext(() =>
        authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
      ) as Observable<boolean>
    );
  };

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
  });

  it('lets a signed-in user through without redirecting', async () => {
    expect(await runGuard(true)).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('blocks a signed-out user and sends them to the sign-in page', async () => {
    expect(await runGuard(false)).toBeFalse();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/auth']);
  });
});

describe('signedOutGuard (the sign-in page)', () => {
  const homeTree = {} as UrlTree;
  let router: jasmine.SpyObj<Router>;

  const runGuard = (signedInAndVerified: boolean) => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isSignedInAndVerifiedAsync: () => of(signedInAndVerified),
          },
        },
        { provide: Router, useValue: router },
      ],
    });

    return firstValueFrom(
      TestBed.runInInjectionContext(() =>
        signedOutGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
      ) as Observable<boolean | UrlTree>
    );
  };

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue(homeTree);
  });

  it('sends a signed-in, verified user to the food search instead', async () => {
    expect(await runGuard(true)).toBe(homeTree);
    expect(router.createUrlTree).toHaveBeenCalledOnceWith(['/oxalate']);
  });

  it('shows the sign-in page to everyone else (signed out or unverified)', async () => {
    expect(await runGuard(false)).toBeTrue();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });
});
