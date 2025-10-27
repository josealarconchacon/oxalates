import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ToastService, Toast } from './toast.service';
import { take } from 'rxjs/operators';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be provided in root', () => {
      const service1 = TestBed.inject(ToastService);
      const service2 = TestBed.inject(ToastService);
      expect(service1).toBe(service2);
    });

    it('should have toasts$ observable defined', () => {
      expect(service.toasts$).toBeDefined();
      expect(typeof service.toasts$.subscribe).toBe('function');
    });

    it('should have dismiss$ observable defined', () => {
      expect(service.dismiss$).toBeDefined();
      expect(typeof service.dismiss$.subscribe).toBe('function');
    });

    it('should have private toastSubject', () => {
      expect(service['toastSubject']).toBeDefined();
    });

    it('should have private dismissSubject', () => {
      expect(service['dismissSubject']).toBeDefined();
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = service['generateId']();
      const id2 = service['generateId']();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with correct prefix', () => {
      const id = service['generateId']();
      expect(id).toMatch(/^toast-\d+-[a-z0-9]+$/);
    });

    it('should generate IDs with timestamp component', () => {
      const id = service['generateId']();
      expect(id).toContain('toast-');
      const parts = id.split('-');
      expect(parts.length).toBe(3);
      expect(Number(parts[1])).toBeGreaterThan(0);
    });

    it('should generate multiple unique IDs rapidly', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(service['generateId']());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('success', () => {
    it('should emit success toast with correct properties', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.message).toBe('Success message');
        expect(toast.type).toBe('success');
        expect(toast.duration).toBe(3000);
        expect(toast.dismissible).toBe(true);
        expect(toast.id).toBeDefined();
        expect(toast.id).toMatch(/^toast-/);
        done();
      });

      service.success('Success message');
    });

    it('should use default duration of 3000ms when not specified', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.duration).toBe(3000);
        done();
      });

      service.success('Test');
    });

    it('should accept custom duration', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.duration).toBe(5000);
        done();
      });

      service.success('Test', 5000);
    });

    it('should generate unique ID for each toast', (done) => {
      const ids: string[] = [];

      const subscription = service.toasts$.subscribe((toast) => {
        ids.push(toast.id);
        if (ids.length === 3) {
          expect(ids[0]).not.toBe(ids[1]);
          expect(ids[1]).not.toBe(ids[2]);
          expect(ids[0]).not.toBe(ids[2]);
          subscription.unsubscribe();
          done();
        }
      });

      service.success('First');
      service.success('Second');
      service.success('Third');
    });

    it('should auto-dismiss after duration', fakeAsync(() => {
      let dismissedId = '';

      service.dismiss$.pipe(take(1)).subscribe((id) => {
        dismissedId = id;
      });

      let toastId = '';
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        toastId = toast.id;
      });

      service.success('Auto dismiss test', 1000);

      tick(1000);

      expect(dismissedId).toBe(toastId);
    }));

    it('should handle empty message', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.message).toBe('');
        expect(toast.type).toBe('success');
        done();
      });

      service.success('');
    });

    it('should handle very long messages', (done) => {
      const longMessage = 'a'.repeat(1000);

      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.message).toBe(longMessage);
        done();
      });

      service.success(longMessage);
    });

    it('should handle special characters in message', (done) => {
      const specialMessage = '<script>alert("XSS")</script>';

      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.message).toBe(specialMessage);
        done();
      });

      service.success(specialMessage);
    });

    it('should accept zero duration', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.duration).toBe(0);
        done();
      });

      service.success('Test', 0);
    });

    it('should accept negative duration', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.duration).toBe(-1);
        done();
      });

      service.success('Test', -1);
    });
  });

  describe('error', () => {
    it('should emit error toast with correct properties', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.message).toBe('Error message');
        expect(toast.type).toBe('error');
        expect(toast.duration).toBe(5000);
        expect(toast.dismissible).toBe(true);
        expect(toast.id).toBeDefined();
        done();
      });

      service.error('Error message');
    });

    it('should use default duration of 5000ms when not specified', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.duration).toBe(5000);
        done();
      });

      service.error('Test');
    });

    it('should accept custom duration', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.duration).toBe(3000);
        done();
      });

      service.error('Test', 3000);
    });

    it('should auto-dismiss after duration', fakeAsync(() => {
      let dismissedId = '';

      service.dismiss$.pipe(take(1)).subscribe((id) => {
        dismissedId = id;
      });

      let toastId = '';
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        toastId = toast.id;
      });

      service.error('Auto dismiss error', 2000);

      tick(2000);

      expect(dismissedId).toBe(toastId);
    }));
  });

  describe('warning', () => {
    it('should emit warning toast with correct properties', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.message).toBe('Warning message');
        expect(toast.type).toBe('warning');
        expect(toast.duration).toBe(4000);
        expect(toast.dismissible).toBe(true);
        expect(toast.id).toBeDefined();
        done();
      });

      service.warning('Warning message');
    });

    it('should use default duration of 4000ms when not specified', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.duration).toBe(4000);
        done();
      });

      service.warning('Test');
    });

    it('should accept custom duration', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.duration).toBe(6000);
        done();
      });

      service.warning('Test', 6000);
    });

    it('should auto-dismiss after duration', fakeAsync(() => {
      let dismissedId = '';

      service.dismiss$.pipe(take(1)).subscribe((id) => {
        dismissedId = id;
      });

      let toastId = '';
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        toastId = toast.id;
      });

      service.warning('Auto dismiss warning', 1500);

      tick(1500);

      expect(dismissedId).toBe(toastId);
    }));
  });

  describe('info', () => {
    it('should emit info toast with correct properties', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.message).toBe('Info message');
        expect(toast.type).toBe('info');
        expect(toast.duration).toBe(3000);
        expect(toast.dismissible).toBe(true);
        expect(toast.id).toBeDefined();
        done();
      });

      service.info('Info message');
    });

    it('should use default duration of 3000ms when not specified', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.duration).toBe(3000);
        done();
      });

      service.info('Test');
    });

    it('should accept custom duration', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.duration).toBe(2000);
        done();
      });

      service.info('Test', 2000);
    });

    it('should auto-dismiss after duration', fakeAsync(() => {
      let dismissedId = '';

      service.dismiss$.pipe(take(1)).subscribe((id) => {
        dismissedId = id;
      });

      let toastId = '';
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        toastId = toast.id;
      });

      service.info('Auto dismiss info', 1000);

      tick(1000);

      expect(dismissedId).toBe(toastId);
    }));
  });

  describe('show', () => {
    it('should emit toast to toasts$ observable', (done) => {
      const customToast: Toast = {
        id: 'custom-id',
        message: 'Custom toast',
        type: 'success',
        duration: 2000,
        dismissible: false,
      };

      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast).toEqual(customToast);
        done();
      });

      service.show(customToast);
    });

    it('should auto-dismiss toast with positive duration', fakeAsync(() => {
      let dismissedId = '';

      service.dismiss$.pipe(take(1)).subscribe((id) => {
        dismissedId = id;
      });

      service.show({
        id: 'test-123',
        message: 'Test',
        type: 'info',
        duration: 1000,
      });

      tick(1000);

      expect(dismissedId).toBe('test-123');
    }));

    it('should not auto-dismiss toast with zero duration', fakeAsync(() => {
      let dismissed = false;

      service.dismiss$.pipe(take(1)).subscribe(() => {
        dismissed = true;
      });

      service.show({
        id: 'test-123',
        message: 'Test',
        type: 'info',
        duration: 0,
      });

      tick(5000);

      expect(dismissed).toBe(false);
    }));

    it('should not auto-dismiss toast with negative duration', fakeAsync(() => {
      let dismissed = false;

      service.dismiss$.pipe(take(1)).subscribe(() => {
        dismissed = true;
      });

      service.show({
        id: 'test-123',
        message: 'Test',
        type: 'info',
        duration: -1,
      });

      tick(5000);

      expect(dismissed).toBe(false);
    }));

    it('should not auto-dismiss toast without duration', fakeAsync(() => {
      let dismissed = false;

      service.dismiss$.pipe(take(1)).subscribe(() => {
        dismissed = true;
      });

      service.show({
        id: 'test-123',
        message: 'Test',
        type: 'info',
      });

      tick(5000);

      expect(dismissed).toBe(false);
    }));

    it('should handle toast with all optional properties undefined', (done) => {
      const minimalToast: Toast = {
        id: 'minimal',
        message: 'Minimal',
        type: 'info',
      };

      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.duration).toBeUndefined();
        expect(toast.dismissible).toBeUndefined();
        done();
      });

      service.show(minimalToast);
    });

    it('should broadcast to multiple subscribers', (done) => {
      let subscriber1Received = false;
      let subscriber2Received = false;
      let subscriber3Received = false;

      service.toasts$.subscribe((toast) => {
        subscriber1Received = true;
      });

      service.toasts$.subscribe((toast) => {
        subscriber2Received = true;
      });

      service.toasts$.subscribe((toast) => {
        subscriber3Received = true;
      });

      service.show({
        id: 'broadcast',
        message: 'Broadcast',
        type: 'info',
      });

      setTimeout(() => {
        expect(subscriber1Received).toBe(true);
        expect(subscriber2Received).toBe(true);
        expect(subscriber3Received).toBe(true);
        done();
      }, 50);
    });

    it('should handle rapid successive toasts', fakeAsync(() => {
      const toasts: Toast[] = [];

      service.toasts$.subscribe((toast) => {
        toasts.push(toast);
      });

      for (let i = 0; i < 10; i++) {
        service.show({
          id: `toast-${i}`,
          message: `Message ${i}`,
          type: 'info',
          duration: 1000,
        });
      }
      expect(toasts.length).toBe(10);
      tick(1000);
      flush();
    }));

    it('should handle different toast types', (done) => {
      const toasts: Toast[] = [];

      const subscription = service.toasts$.subscribe((toast) => {
        toasts.push(toast);
        if (toasts.length === 4) {
          expect(toasts[0].type).toBe('success');
          expect(toasts[1].type).toBe('error');
          expect(toasts[2].type).toBe('warning');
          expect(toasts[3].type).toBe('info');
          subscription.unsubscribe();
          done();
        }
      });

      service.show({ id: '1', message: 'Test', type: 'success' });
      service.show({ id: '2', message: 'Test', type: 'error' });
      service.show({ id: '3', message: 'Test', type: 'warning' });
      service.show({ id: '4', message: 'Test', type: 'info' });
    });
  });

  describe('dismiss', () => {
    it('should emit toast ID to dismiss$ observable', (done) => {
      service.dismiss$.pipe(take(1)).subscribe((id) => {
        expect(id).toBe('toast-123');
        done();
      });

      service.dismiss('toast-123');
    });

    it('should handle empty string ID', (done) => {
      service.dismiss$.pipe(take(1)).subscribe((id) => {
        expect(id).toBe('');
        done();
      });

      service.dismiss('');
    });

    it('should handle special characters in ID', (done) => {
      const specialId = 'toast-<>?/\\';

      service.dismiss$.pipe(take(1)).subscribe((id) => {
        expect(id).toBe(specialId);
        done();
      });

      service.dismiss(specialId);
    });

    it('should broadcast to multiple subscribers', (done) => {
      let subscriber1Received = false;
      let subscriber2Received = false;

      service.dismiss$.subscribe(() => {
        subscriber1Received = true;
      });

      service.dismiss$.subscribe(() => {
        subscriber2Received = true;
      });

      service.dismiss('test-id');

      setTimeout(() => {
        expect(subscriber1Received).toBe(true);
        expect(subscriber2Received).toBe(true);
        done();
      }, 50);
    });

    it('should handle multiple dismissals', (done) => {
      const dismissedIds: string[] = [];

      const subscription = service.dismiss$.subscribe((id) => {
        dismissedIds.push(id);
        if (dismissedIds.length === 3) {
          expect(dismissedIds).toEqual(['id1', 'id2', 'id3']);
          subscription.unsubscribe();
          done();
        }
      });

      service.dismiss('id1');
      service.dismiss('id2');
      service.dismiss('id3');
    });

    it('should not affect toast emissions', (done) => {
      let toastReceived = false;
      let dismissReceived = false;

      service.toasts$.pipe(take(1)).subscribe(() => {
        toastReceived = true;
      });

      service.dismiss$.pipe(take(1)).subscribe(() => {
        dismissReceived = true;
      });

      service.show({ id: '1', message: 'Test', type: 'info' });
      service.dismiss('1');

      setTimeout(() => {
        expect(toastReceived).toBe(true);
        expect(dismissReceived).toBe(true);
        done();
      }, 50);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete toast lifecycle', fakeAsync(() => {
      let toastEmitted = false;
      let toastDismissed = false;
      let toastId = '';

      service.toasts$.pipe(take(1)).subscribe((toast) => {
        toastEmitted = true;
        toastId = toast.id;
      });

      service.dismiss$.pipe(take(1)).subscribe((id) => {
        toastDismissed = true;
        expect(id).toBe(toastId);
      });
      service.success('Test message', 1000);
      expect(toastEmitted).toBe(true);
      tick(1000);
      expect(toastDismissed).toBe(true);
    }));

    it('should handle multiple toasts with different durations', fakeAsync(() => {
      const dismissedIds: string[] = [];

      service.dismiss$.subscribe((id) => {
        dismissedIds.push(id);
      });

      service.success('Fast', 500);
      service.error('Medium', 1000);
      service.warning('Slow', 1500);
      tick(500);
      expect(dismissedIds.length).toBe(1);
      tick(500);
      expect(dismissedIds.length).toBe(2);
      tick(500);
      expect(dismissedIds.length).toBe(3);
    }));

    it('should handle manual dismissal before auto-dismiss', fakeAsync(() => {
      const dismissedIds: string[] = [];
      let toastId = '';

      service.toasts$.pipe(take(1)).subscribe((toast) => {
        toastId = toast.id;
      });

      service.dismiss$.subscribe((id) => {
        dismissedIds.push(id);
      });

      service.success('Test', 5000);
      tick(1000);
      service.dismiss(toastId);
      expect(dismissedIds.length).toBe(1);
      expect(dismissedIds[0]).toBe(toastId);
      tick(4000);
      expect(dismissedIds.length).toBe(2);
    }));

    it('should handle all toast types in sequence', (done) => {
      const toasts: Toast[] = [];

      const subscription = service.toasts$.subscribe((toast) => {
        toasts.push(toast);
        if (toasts.length === 4) {
          expect(toasts[0].type).toBe('success');
          expect(toasts[0].duration).toBe(3000);
          expect(toasts[1].type).toBe('error');
          expect(toasts[1].duration).toBe(5000);
          expect(toasts[2].type).toBe('warning');
          expect(toasts[2].duration).toBe(4000);
          expect(toasts[3].type).toBe('info');
          expect(toasts[3].duration).toBe(3000);
          subscription.unsubscribe();
          done();
        }
      });

      service.success('Success');
      service.error('Error');
      service.warning('Warning');
      service.info('Info');
    });

    it('should allow late subscribers to receive subsequent emissions', fakeAsync(() => {
      const firstSubscriberToasts: string[] = [];
      const secondSubscriberToasts: string[] = [];

      service.toasts$.subscribe((toast) => {
        firstSubscriberToasts.push(toast.message);
      });

      service.success('Before second subscriber');
      tick(100);
      service.toasts$.subscribe((toast) => {
        secondSubscriberToasts.push(toast.message);
      });

      service.error('After second subscriber');
      tick(100);
      expect(firstSubscriberToasts).toEqual([
        'Before second subscriber',
        'After second subscriber',
      ]);
      expect(secondSubscriberToasts).toEqual(['After second subscriber']);
      flush();
    }));
  });

  describe('Edge Cases', () => {
    it('should handle calling show before any subscribers', () => {
      expect(() =>
        service.show({ id: '1', message: 'Test', type: 'info' })
      ).not.toThrow();
    });

    it('should handle calling dismiss before any subscribers', () => {
      expect(() => service.dismiss('test-id')).not.toThrow();
    });

    it('should handle unicode in messages', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.message).toBe('🎉 Success! 你好 مرحبا');
        done();
      });

      service.success('🎉 Success! 你好 مرحبا');
    });

    it('should handle very large duration values', fakeAsync(() => {
      const largeToast: Toast = {
        id: 'large',
        message: 'Large duration',
        type: 'info',
        duration: Number.MAX_SAFE_INTEGER,
      };

      expect(() => service.show(largeToast)).not.toThrow();
      flush();
    }));

    it('should handle toast with dismissible false', (done) => {
      service.toasts$.pipe(take(1)).subscribe((toast) => {
        expect(toast.dismissible).toBe(false);
        done();
      });

      service.show({
        id: 'non-dismissible',
        message: 'Cannot dismiss',
        type: 'error',
        dismissible: false,
      });
    });

    it('should preserve toast property order', (done) => {
      const customToast: Toast = {
        id: 'order-test',
        message: 'Order test',
        type: 'success',
        duration: 1000,
        dismissible: true,
      };

      service.toasts$.pipe(take(1)).subscribe((toast) => {
        const keys = Object.keys(toast);
        expect(keys).toEqual([
          'id',
          'message',
          'type',
          'duration',
          'dismissible',
        ]);
        done();
      });

      service.show(customToast);
    });
  });

  describe('Memory and Performance', () => {
    it('should handle many simultaneous toasts', fakeAsync(() => {
      const toasts: Toast[] = [];

      service.toasts$.subscribe((toast) => {
        toasts.push(toast);
      });

      for (let i = 0; i < 100; i++) {
        service.success(`Toast ${i}`, 1000);
      }

      expect(toasts.length).toBe(100);

      tick(1000);
      flush();
    }));

    it('should properly clean up timers on dismiss', fakeAsync(() => {
      service.success('Test', 10000);
      tick(1000);
      expect(() => flush()).not.toThrow();
    }));

    it('should handle unsubscribe without errors', (done) => {
      const subscription1 = service.toasts$.subscribe(() => {});
      const subscription2 = service.dismiss$.subscribe(() => {});

      subscription1.unsubscribe();
      subscription2.unsubscribe();

      setTimeout(() => {
        expect(() => service.success('After unsubscribe')).not.toThrow();
        done();
      }, 50);
    });
  });
});
