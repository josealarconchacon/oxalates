import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from './auth-service.service';

/** Lets signed-in users through and sends everyone else to the sign-in page. */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticatedAsync().pipe(
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }
      router.navigate(['/auth']);
      return false;
    })
  );
};

/**
 * For the sign-in page: someone already signed in (with a verified email)
 * goes straight to the food search, where signing in would have taken them.
 */
export const signedOutGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService
    .isSignedInAndVerifiedAsync()
    .pipe(
      map((signedIn) => (signedIn ? router.createUrlTree(['/oxalate']) : true))
    );
};
