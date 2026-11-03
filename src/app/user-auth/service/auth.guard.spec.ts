import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AuthService } from './auth-service.service';
import { authGuard } from './auth.guard';

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
