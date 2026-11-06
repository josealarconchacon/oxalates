import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthMessageService } from './auth-message.service';

describe('AuthMessageService', () => {
  let service: AuthMessageService;
  let router: jasmine.SpyObj<Router>;

  const isShown = () => firstValueFrom(service.showMessage$);

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }],
    });
    service = TestBed.inject(AuthMessageService);
  });

  it('starts hidden', async () => {
    expect(await isShown()).toBeFalse();
  });

  it('shows the prompt', async () => {
    service.showAuthMessage();
    expect(await isShown()).toBeTrue();
  });

  it('"Sign in" hides the prompt and opens the sign-in page', async () => {
    service.showAuthMessage();
    service.continueToAuth();

    expect(await isShown()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/auth']);
  });

  it('dismiss hides the prompt and leaves the visitor where they are', async () => {
    service.showAuthMessage();
    service.dismiss();

    expect(await isShown()).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('never closes or navigates on its own', fakeAsync(() => {
    let shown = false;
    service.showMessage$.subscribe((v) => (shown = v));
    service.showAuthMessage();

    tick(60_000);

    expect(shown).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  }));
});
