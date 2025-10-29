import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { AuthMessageService } from './auth-message.service';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

describe('AuthMessageService', () => {
  let service: AuthMessageService;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [AuthMessageService, { provide: Router, useValue: routerSpy }],
    });

    service = TestBed.inject(AuthMessageService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    if (service['timerSubscription']) {
      service['timerSubscription'].unsubscribe();
    }
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be provided in root', () => {
      const service1 = TestBed.inject(AuthMessageService);
      const service2 = TestBed.inject(AuthMessageService);
      expect(service1).toBe(service2);
    });

    it('should inject Router', () => {
      expect(router).toBeTruthy();
    });

    it('should have showMessage$ observable', () => {
      expect(service.showMessage$).toBeDefined();
      expect(typeof service.showMessage$.subscribe).toBe('function');
    });

    it('should have private showMessageSubject', () => {
      expect(service['showMessageSubject']).toBeDefined();
    });

    it('should initialize showMessageSubject with false', () => {
      expect(service['showMessageSubject'].value).toBe(false);
    });

    it('should initialize timerSubscription as null', () => {
      expect(service['timerSubscription']).toBeNull();
    });

    it('should emit false initially from showMessage$ observable', (done) => {
      service.showMessage$.pipe(take(1)).subscribe((show) => {
        expect(show).toBe(false);
        done();
      });
    });
  });

  describe('showAuthMessage', () => {
    it('should return a Promise', () => {
      const result = service.showAuthMessage();
      expect(result instanceof Promise).toBe(true);
      service.continueToAuth();
    });

    it('should set showMessage to true immediately', fakeAsync(() => {
      let currentValue = false;

      service.showMessage$.subscribe((show) => {
        currentValue = show;
      });
      service.showAuthMessage();
      expect(currentValue).toBe(true);
      service.continueToAuth();
    }));

    it('should emit true through showMessage$ observable', fakeAsync(() => {
      const emissions: boolean[] = [];

      service.showMessage$.subscribe((show) => {
        emissions.push(show);
      });
      service.showAuthMessage();
      expect(emissions).toEqual([false, true]);
      service.continueToAuth();
    }));

    it('should create a timer subscription', fakeAsync(() => {
      service.showAuthMessage();
      expect(service['timerSubscription']).not.toBeNull();
      expect(service['timerSubscription']).toBeDefined();
      service.continueToAuth();
    }));

    it('should automatically call continueToAuth after 10 seconds', fakeAsync(() => {
      service.showAuthMessage();
      expect(router.navigate).not.toHaveBeenCalled();
      tick(10000);
      expect(router.navigate).toHaveBeenCalledWith(['/auth']);
    }));

    it('should set showMessage to false after 10 seconds', fakeAsync(() => {
      let finalValue = true;

      service.showMessage$.subscribe((show) => {
        finalValue = show;
      });
      service.showAuthMessage();
      expect(finalValue).toBe(true);
      tick(10000);
      expect(finalValue).toBe(false);
    }));

    it('should resolve the promise after 10 seconds', fakeAsync(() => {
      let resolved = false;

      service.showAuthMessage().then(() => {
        resolved = true;
      });
      expect(resolved).toBe(false);
      tick(10000);
      expect(resolved).toBe(true);
    }));

    it('should unsubscribe timer after 10 seconds', fakeAsync(() => {
      service.showAuthMessage();

      const subscription = service['timerSubscription'];
      expect(subscription).not.toBeNull();

      tick(10000);

      expect(service['timerSubscription']).toBeNull();
    }));

    it('should overwrite timer subscription on consecutive calls', fakeAsync(() => {
      service.showAuthMessage();
      tick(5000);
      service.showAuthMessage();
      tick(5000);
      expect(router.navigate).toHaveBeenCalledTimes(1);
      tick(5000);
      expect(router.navigate).toHaveBeenCalledTimes(1);
    }));

    it('should emit to multiple subscribers', fakeAsync(() => {
      let subscriber1Value = false;
      let subscriber2Value = false;

      service.showMessage$.subscribe((show) => {
        subscriber1Value = show;
      });

      service.showMessage$.subscribe((show) => {
        subscriber2Value = show;
      });

      service.showAuthMessage();
      expect(subscriber1Value).toBe(true);
      expect(subscriber2Value).toBe(true);
      service.continueToAuth();
    }));

    it('should not navigate before 10 seconds', fakeAsync(() => {
      service.showAuthMessage();
      tick(9999);
      expect(router.navigate).not.toHaveBeenCalled();
      tick(1);
      expect(router.navigate).toHaveBeenCalled();
    }));
  });

  describe('continueToAuth', () => {
    it('should set showMessage to false', () => {
      service['showMessageSubject'].next(true);

      service.continueToAuth();

      expect(service['showMessageSubject'].value).toBe(false);
    });

    it('should navigate to /auth route', () => {
      service.continueToAuth();

      expect(router.navigate).toHaveBeenCalledWith(['/auth']);
    });

    it('should navigate exactly once per call', () => {
      service.continueToAuth();

      expect(router.navigate).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from timer if it exists', fakeAsync(() => {
      service.showAuthMessage();

      const subscription = service['timerSubscription'];
      const unsubSpy = spyOn(subscription!, 'unsubscribe').and.callThrough();

      service.continueToAuth();

      expect(unsubSpy).toHaveBeenCalled();
    }));

    it('should set timerSubscription to null after unsubscribing', fakeAsync(() => {
      service.showAuthMessage();
      expect(service['timerSubscription']).not.toBeNull();
      service.continueToAuth();
      expect(service['timerSubscription']).toBeNull();
    }));

    it('should not throw error if timerSubscription is null', () => {
      service['timerSubscription'] = null;

      expect(() => service.continueToAuth()).not.toThrow();
    });

    it('should not throw error if timerSubscription is undefined', () => {
      service['timerSubscription'] = undefined as any;

      expect(() => service.continueToAuth()).not.toThrow();
    });

    it('should emit false through showMessage$ observable', (done) => {
      service['showMessageSubject'].next(true);

      let emissionCount = 0;
      const emissions: boolean[] = [];

      service.showMessage$.subscribe((show) => {
        emissions.push(show);
        emissionCount++;
        if (emissionCount === 2) {
          expect(emissions).toEqual([true, false]);
          done();
        }
      });

      service.continueToAuth();
    });

    it('should handle multiple calls without error', () => {
      service.continueToAuth();
      service.continueToAuth();
      service.continueToAuth();

      expect(router.navigate).toHaveBeenCalledTimes(3);
      expect(service['timerSubscription']).toBeNull();
    });

    it('should work correctly when called before showAuthMessage', () => {
      expect(() => service.continueToAuth()).not.toThrow();
      expect(router.navigate).toHaveBeenCalledWith(['/auth']);
    });

    it('should interrupt the timer when called manually', fakeAsync(() => {
      let promiseResolved = false;

      service.showAuthMessage().then(() => {
        promiseResolved = true;
      });

      tick(5000);

      service.continueToAuth();

      expect(router.navigate).toHaveBeenCalledTimes(1);
      expect(service['timerSubscription']).toBeNull();

      tick(5000);
      expect(promiseResolved).toBe(false);
      expect(router.navigate).toHaveBeenCalledTimes(1);
    }));

    it('should cancel pending navigation when called early', fakeAsync(() => {
      service.showAuthMessage();
      tick(3000);
      service.continueToAuth();
      expect(router.navigate).toHaveBeenCalledTimes(1);
      tick(7000);
      expect(router.navigate).toHaveBeenCalledTimes(1);
    }));
  });

  describe('Integration Tests', () => {
    it('should handle complete message lifecycle', fakeAsync(() => {
      const emissions: boolean[] = [];

      service.showMessage$.subscribe((show) => {
        emissions.push(show);
      });

      service.showAuthMessage();
      expect(emissions).toEqual([false, true]);
      expect(router.navigate).not.toHaveBeenCalled();
      tick(10000);
      expect(emissions).toEqual([false, true, false]);
      expect(router.navigate).toHaveBeenCalledWith(['/auth']);
    }));

    it('should handle manual interrupt of message', fakeAsync(() => {
      const emissions: boolean[] = [];

      service.showMessage$.subscribe((show) => {
        emissions.push(show);
      });
      service.showAuthMessage();
      expect(emissions).toEqual([false, true]);
      tick(5000);
      service.continueToAuth();
      expect(emissions).toEqual([false, true, false]);
      expect(router.navigate).toHaveBeenCalledTimes(1);
      tick(5000);
      expect(router.navigate).toHaveBeenCalledTimes(1);
    }));

    it('should handle multiple message cycles', fakeAsync(() => {
      service.showAuthMessage();
      tick(10000);
      expect(router.navigate).toHaveBeenCalledTimes(1);
      service.showAuthMessage();
      tick(10000);
      expect(router.navigate).toHaveBeenCalledTimes(2);
      service.showAuthMessage();
      tick(5000);
      service.continueToAuth();
      expect(router.navigate).toHaveBeenCalledTimes(3);
    }));

    it('should maintain state consistency', fakeAsync(() => {
      service.showAuthMessage();
      expect(service['showMessageSubject'].value).toBe(true);
      expect(service['timerSubscription']).not.toBeNull();
      tick(10000);
      expect(service['showMessageSubject'].value).toBe(false);
      expect(service['timerSubscription']).toBeNull();
    }));

    it('should work with late subscribers', fakeAsync(() => {
      service.showAuthMessage();
      tick(3000);

      let lateSubscriberValue = false;
      service.showMessage$.pipe(take(1)).subscribe((show) => {
        lateSubscriberValue = show;
      });

      expect(lateSubscriberValue).toBe(true);
      tick(7000);
      service.showMessage$.pipe(take(1)).subscribe((show) => {
        lateSubscriberValue = show;
      });

      expect(lateSubscriberValue).toBe(false);
    }));
  });

  describe('Edge Cases', () => {
    it('should handle router.navigate throwing error', () => {
      router.navigate.and.throwError('Navigation error');

      expect(() => service.continueToAuth()).toThrow();
    });

    it('should handle rapid showAuthMessage calls', fakeAsync(() => {
      for (let i = 0; i < 5; i++) {
        service.showAuthMessage();
      }
      tick(10000);
      expect(router.navigate).toHaveBeenCalled();
      expect(router.navigate.calls.count()).toBeGreaterThanOrEqual(1);
      expect(router.navigate.calls.count()).toBeLessThanOrEqual(5);
    }));

    it('should handle showAuthMessage followed immediately by continueToAuth', fakeAsync(() => {
      service.showAuthMessage();
      service.continueToAuth();
      expect(service['timerSubscription']).toBeNull();
      expect(router.navigate).toHaveBeenCalledTimes(1);
      tick(10000);
      expect(router.navigate).toHaveBeenCalledTimes(1);
    }));

    it('should handle timer completing while multiple subscribers active', fakeAsync(() => {
      const values1: boolean[] = [];
      const values2: boolean[] = [];
      const values3: boolean[] = [];

      service.showMessage$.subscribe((v) => values1.push(v));
      service.showMessage$.subscribe((v) => values2.push(v));
      service.showMessage$.subscribe((v) => values3.push(v));

      service.showAuthMessage();
      tick(10000);

      expect(values1).toEqual([false, true, false]);
      expect(values2).toEqual([false, true, false]);
      expect(values3).toEqual([false, true, false]);
    }));

    it('should handle unsubscribe during active timer', fakeAsync(() => {
      const sub = service.showMessage$.subscribe(() => {});
      service.showAuthMessage();
      sub.unsubscribe();
      tick(10000);
      expect(router.navigate).toHaveBeenCalled();
    }));

    it('should handle calling continueToAuth multiple times rapidly', () => {
      service.continueToAuth();
      service.continueToAuth();
      service.continueToAuth();

      expect(router.navigate).toHaveBeenCalledTimes(3);
    });
  });

  describe('Observable Behavior', () => {
    it('should emit current value immediately to new subscribers', (done) => {
      service['showMessageSubject'].next(true);

      service.showMessage$.pipe(take(1)).subscribe((show) => {
        expect(show).toBe(true);
        done();
      });
    });

    it('should support multiple concurrent subscribers', fakeAsync(() => {
      const values1: boolean[] = [];
      const values2: boolean[] = [];

      service.showMessage$.subscribe((v) => values1.push(v));
      service.showMessage$.subscribe((v) => values2.push(v));
      service.showAuthMessage();
      service.continueToAuth();
      expect(values1).toEqual([false, true, false]);
      expect(values2).toEqual([false, true, false]);
      tick(10000);
    }));

    it('should continue emitting after a subscriber unsubscribes', fakeAsync(() => {
      const values: boolean[] = [];
      const sub = service.showMessage$.subscribe((v) => values.push(v));
      service.showAuthMessage();
      sub.unsubscribe();
      service.continueToAuth();
      expect(values).toEqual([false, true]);
      tick(10000);
    }));
  });

  describe('Memory and Performance', () => {
    it('should properly clean up timer subscription', fakeAsync(() => {
      service.showAuthMessage();
      const subscription = service['timerSubscription'];
      expect(subscription).not.toBeNull();
      tick(10000);
      expect(service['timerSubscription']).toBeNull();
    }));

    it('should handle many subscribers without memory issues', fakeAsync(() => {
      const subscriptions = [];
      for (let i = 0; i < 100; i++) {
        subscriptions.push(service.showMessage$.subscribe(() => {}));
      }
      service.showAuthMessage();
      tick(10000);
      subscriptions.forEach((sub) => sub.unsubscribe());
      expect(router.navigate).toHaveBeenCalled();
    }));

    it('should not leak subscriptions on repeated calls', fakeAsync(() => {
      for (let i = 0; i < 10; i++) {
        service.showAuthMessage();
        service.continueToAuth();
      }

      expect(service['timerSubscription']).toBeNull();
    }));

    it('should handle rapid toggle of message state', fakeAsync(() => {
      for (let i = 0; i < 20; i++) {
        service.showAuthMessage();
        service.continueToAuth();
      }

      expect(service['showMessageSubject'].value).toBe(false);
      expect(router.navigate).toHaveBeenCalledTimes(20);
    }));
  });

  describe('Promise Resolution', () => {
    it('should resolve promise only after full timer duration', fakeAsync(() => {
      let resolved = false;

      service.showAuthMessage().then(() => {
        resolved = true;
      });

      tick(9999);
      expect(resolved).toBe(false);

      tick(1);
      expect(resolved).toBe(true);
    }));

    it('should not resolve promise if interrupted by continueToAuth', fakeAsync(() => {
      let resolved = false;

      service.showAuthMessage().then(() => {
        resolved = true;
      });

      tick(5000);
      service.continueToAuth();

      tick(10000);
      expect(resolved).toBe(false);
    }));

    it('should handle awaiting the promise', fakeAsync(async () => {
      const promise = service.showAuthMessage();

      tick(10000);

      await promise;

      expect(router.navigate).toHaveBeenCalled();
    }));

    it('should allow chaining then calls', fakeAsync(() => {
      let firstThenCalled = false;
      let secondThenCalled = false;

      service
        .showAuthMessage()
        .then(() => {
          firstThenCalled = true;
        })
        .then(() => {
          secondThenCalled = true;
        });
      tick(10000);
      expect(firstThenCalled).toBe(true);
      expect(secondThenCalled).toBe(true);
    }));
  });
});
