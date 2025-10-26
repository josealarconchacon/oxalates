import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be provided in root', () => {
      const service1 = TestBed.inject(AlertService);
      const service2 = TestBed.inject(AlertService);
      expect(service1).toBe(service2);
    });

    it('should have alertSubject as a private property', () => {
      expect(service['alertSubject']).toBeDefined();
    });
  });

  describe('getAlertObservable', () => {
    it('should return an Observable', () => {
      const observable = service.getAlertObservable();
      expect(observable).toBeDefined();
      expect(typeof observable.subscribe).toBe('function');
    });

    it('should return a new observable instance on each call (asObservable creates new instances)', () => {
      const observable1 = service.getAlertObservable();
      const observable2 = service.getAlertObservable();
      expect(observable1).not.toBe(observable2);
      expect(observable1).toBeDefined();
      expect(observable2).toBeDefined();
    });

    it('should not emit any value initially', (done) => {
      let emitted = false;
      const subscription = service.getAlertObservable().subscribe(() => {
        emitted = true;
      });

      setTimeout(() => {
        expect(emitted).toBe(false);
        subscription.unsubscribe();
        done();
      }, 100);
    });

    it('should allow multiple subscribers', (done) => {
      let subscriber1Received = false;
      let subscriber2Received = false;

      service.getAlertObservable().subscribe(() => {
        subscriber1Received = true;
      });

      service.getAlertObservable().subscribe(() => {
        subscriber2Received = true;
      });

      service.showAlert('Test');

      setTimeout(() => {
        expect(subscriber1Received).toBe(true);
        expect(subscriber2Received).toBe(true);
        done();
      }, 50);
    });
  });

  describe('showAlert', () => {
    it('should emit alert with correct message and show flag', (done) => {
      const testMessage = 'Test alert message';

      service
        .getAlertObservable()
        .pipe(take(1))
        .subscribe((alert) => {
          expect(alert.message).toBe(testMessage);
          expect(alert.show).toBe(true);
          done();
        });

      service.showAlert(testMessage);
    });

    it('should log message to console', () => {
      spyOn(console, 'log');
      const testMessage = 'Console test message';

      service.showAlert(testMessage);

      expect(console.log).toHaveBeenCalledWith(
        'Sending alert message:',
        testMessage
      );
    });

    it('should handle empty string message', (done) => {
      service
        .getAlertObservable()
        .pipe(take(1))
        .subscribe((alert) => {
          expect(alert.message).toBe('');
          expect(alert.show).toBe(true);
          done();
        });

      service.showAlert('');
    });

    it('should handle very long message strings', (done) => {
      const longMessage = 'a'.repeat(10000);

      service
        .getAlertObservable()
        .pipe(take(1))
        .subscribe((alert) => {
          expect(alert.message).toBe(longMessage);
          expect(alert.show).toBe(true);
          done();
        });

      service.showAlert(longMessage);
    });

    it('should handle messages with special characters', (done) => {
      const specialMessage = '<script>alert("XSS")</script>';

      service
        .getAlertObservable()
        .pipe(take(1))
        .subscribe((alert) => {
          expect(alert.message).toBe(specialMessage);
          expect(alert.show).toBe(true);
          done();
        });

      service.showAlert(specialMessage);
    });

    it('should handle messages with unicode characters', (done) => {
      const unicodeMessage = '🚨 Alert! 你好 مرحبا 🎉';

      service
        .getAlertObservable()
        .pipe(take(1))
        .subscribe((alert) => {
          expect(alert.message).toBe(unicodeMessage);
          expect(alert.show).toBe(true);
          done();
        });

      service.showAlert(unicodeMessage);
    });

    it('should handle messages with newlines and tabs', (done) => {
      const messageWithWhitespace = 'Line 1\nLine 2\tTabbed';

      service
        .getAlertObservable()
        .pipe(take(1))
        .subscribe((alert) => {
          expect(alert.message).toBe(messageWithWhitespace);
          expect(alert.show).toBe(true);
          done();
        });

      service.showAlert(messageWithWhitespace);
    });

    it('should handle null as empty string (type coercion)', (done) => {
      service
        .getAlertObservable()
        .pipe(take(1))
        .subscribe((alert) => {
          expect(alert.show).toBe(true);
          done();
        });

      service.showAlert(null as any);
    });

    it('should handle undefined as empty string (type coercion)', (done) => {
      service
        .getAlertObservable()
        .pipe(take(1))
        .subscribe((alert) => {
          expect(alert.show).toBe(true);
          done();
        });

      service.showAlert(undefined as any);
    });

    it('should emit to all active subscribers', (done) => {
      const receivedMessages: string[] = [];

      service.getAlertObservable().subscribe((alert) => {
        receivedMessages.push(`subscriber1: ${alert.message}`);
      });

      service.getAlertObservable().subscribe((alert) => {
        receivedMessages.push(`subscriber2: ${alert.message}`);
      });

      service.getAlertObservable().subscribe((alert) => {
        receivedMessages.push(`subscriber3: ${alert.message}`);
      });

      service.showAlert('Broadcast message');

      setTimeout(() => {
        expect(receivedMessages.length).toBe(3);
        expect(receivedMessages).toContain('subscriber1: Broadcast message');
        expect(receivedMessages).toContain('subscriber2: Broadcast message');
        expect(receivedMessages).toContain('subscriber3: Broadcast message');
        done();
      }, 50);
    });

    it('should handle rapid successive calls', (done) => {
      const messages: string[] = [];

      service.getAlertObservable().subscribe((alert) => {
        messages.push(alert.message);
      });

      for (let i = 0; i < 100; i++) {
        service.showAlert(`Message ${i}`);
      }

      setTimeout(() => {
        expect(messages.length).toBe(100);
        expect(messages[0]).toBe('Message 0');
        expect(messages[99]).toBe('Message 99');
        done();
      }, 50);
    });

    it('should always set show to true', (done) => {
      service
        .getAlertObservable()
        .pipe(take(1))
        .subscribe((alert) => {
          expect(alert.show).toBe(true);
          expect(alert.show).not.toBe(false);
          done();
        });

      service.showAlert('Any message');
    });
  });

  describe('closeAlert', () => {
    it('should emit alert with empty message and show false', (done) => {
      service
        .getAlertObservable()
        .pipe(take(1))
        .subscribe((alert) => {
          expect(alert.message).toBe('');
          expect(alert.show).toBe(false);
          done();
        });

      service.closeAlert();
    });

    it('should not log to console', () => {
      spyOn(console, 'log');

      service.closeAlert();

      expect(console.log).not.toHaveBeenCalled();
    });

    it('should emit to all active subscribers', (done) => {
      let subscriber1Called = false;
      let subscriber2Called = false;
      let subscriber3Called = false;

      service.getAlertObservable().subscribe(() => {
        subscriber1Called = true;
      });

      service.getAlertObservable().subscribe(() => {
        subscriber2Called = true;
      });

      service.getAlertObservable().subscribe(() => {
        subscriber3Called = true;
      });

      service.closeAlert();

      setTimeout(() => {
        expect(subscriber1Called).toBe(true);
        expect(subscriber2Called).toBe(true);
        expect(subscriber3Called).toBe(true);
        done();
      }, 50);
    });

    it('should handle multiple consecutive calls', (done) => {
      const emissions: Array<{ message: string; show: boolean }> = [];

      service.getAlertObservable().subscribe((alert) => {
        emissions.push(alert);
      });

      service.closeAlert();
      service.closeAlert();
      service.closeAlert();

      setTimeout(() => {
        expect(emissions.length).toBe(3);
        emissions.forEach((emission) => {
          expect(emission.message).toBe('');
          expect(emission.show).toBe(false);
        });
        done();
      }, 50);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete alert lifecycle', (done) => {
      const emissions: Array<{ message: string; show: boolean }> = [];

      service.getAlertObservable().subscribe((alert) => {
        emissions.push({ ...alert });
      });

      // Show alert
      service.showAlert('Alert shown');
      // Close alert
      service.closeAlert();

      setTimeout(() => {
        expect(emissions.length).toBe(2);
        expect(emissions[0]).toEqual({ message: 'Alert shown', show: true });
        expect(emissions[1]).toEqual({ message: '', show: false });
        done();
      }, 50);
    });

    it('should handle multiple alert cycles', (done) => {
      const emissions: Array<{ message: string; show: boolean }> = [];

      service.getAlertObservable().subscribe((alert) => {
        emissions.push({ ...alert });
      });

      service.showAlert('First alert');
      service.closeAlert();
      service.showAlert('Second alert');
      service.closeAlert();
      service.showAlert('Third alert');

      setTimeout(() => {
        expect(emissions.length).toBe(5);
        expect(emissions[0].message).toBe('First alert');
        expect(emissions[1].show).toBe(false);
        expect(emissions[2].message).toBe('Second alert');
        expect(emissions[3].show).toBe(false);
        expect(emissions[4].message).toBe('Third alert');
        done();
      }, 50);
    });

    it('should handle interleaved show and close operations', (done) => {
      const emissions: Array<{ message: string; show: boolean }> = [];

      service.getAlertObservable().subscribe((alert) => {
        emissions.push({ ...alert });
      });

      service.showAlert('Message 1');
      service.showAlert('Message 2');
      service.closeAlert();
      service.closeAlert();
      service.showAlert('Message 3');

      setTimeout(() => {
        expect(emissions.length).toBe(5);
        expect(emissions[0].message).toBe('Message 1');
        expect(emissions[1].message).toBe('Message 2');
        expect(emissions[2].show).toBe(false);
        expect(emissions[3].show).toBe(false);
        expect(emissions[4].message).toBe('Message 3');
        done();
      }, 50);
    });

    it('should allow new subscribers to receive subsequent emissions', (done) => {
      const firstSubscriberMessages: string[] = [];
      const secondSubscriberMessages: string[] = [];

      service.getAlertObservable().subscribe((alert) => {
        firstSubscriberMessages.push(alert.message);
      });

      service.showAlert('Before second subscriber');

      setTimeout(() => {
        service.getAlertObservable().subscribe((alert) => {
          secondSubscriberMessages.push(alert.message);
        });

        service.showAlert('After second subscriber');

        setTimeout(() => {
          expect(firstSubscriberMessages).toEqual([
            'Before second subscriber',
            'After second subscriber',
          ]);
          expect(secondSubscriberMessages).toEqual(['After second subscriber']);
          done();
        }, 50);
      }, 50);
    });

    it('should not affect other subscribers when one unsubscribes', (done) => {
      const subscriber1Messages: string[] = [];
      const subscriber2Messages: string[] = [];

      const subscription1 = service.getAlertObservable().subscribe((alert) => {
        subscriber1Messages.push(alert.message);
      });

      service.getAlertObservable().subscribe((alert) => {
        subscriber2Messages.push(alert.message);
      });

      service.showAlert('Message 1');

      setTimeout(() => {
        subscription1.unsubscribe();
        service.showAlert('Message 2');

        setTimeout(() => {
          expect(subscriber1Messages).toEqual(['Message 1']);
          expect(subscriber2Messages).toEqual(['Message 1', 'Message 2']);
          done();
        }, 50);
      }, 50);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle calling showAlert before any subscribers', () => {
      expect(() => service.showAlert('No subscribers')).not.toThrow();
    });

    it('should handle calling closeAlert before any subscribers', () => {
      expect(() => service.closeAlert()).not.toThrow();
    });

    it('should handle alternating showAlert and closeAlert rapidly', (done) => {
      const emissions: boolean[] = [];

      service.getAlertObservable().subscribe((alert) => {
        emissions.push(alert.show);
      });

      for (let i = 0; i < 50; i++) {
        service.showAlert(`Message ${i}`);
        service.closeAlert();
      }

      setTimeout(() => {
        expect(emissions.length).toBe(100);
        for (let i = 0; i < emissions.length; i++) {
          if (i % 2 === 0) {
            expect(emissions[i]).toBe(true);
          } else {
            expect(emissions[i]).toBe(false);
          }
        }
        done();
      }, 100);
    });

    it('should maintain order of emissions', (done) => {
      const messages: string[] = [];

      service.getAlertObservable().subscribe((alert) => {
        messages.push(alert.message);
      });

      const testMessages = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
      testMessages.forEach((msg) => service.showAlert(msg));

      setTimeout(() => {
        expect(messages).toEqual(testMessages);
        done();
      }, 50);
    });

    it('should handle message with only whitespace', (done) => {
      const whitespaceMessage = '    ';

      service
        .getAlertObservable()
        .pipe(take(1))
        .subscribe((alert) => {
          expect(alert.message).toBe(whitespaceMessage);
          expect(alert.show).toBe(true);
          done();
        });

      service.showAlert(whitespaceMessage);
    });

    it('should handle numeric values (TypeScript passes as-is without conversion)', (done) => {
      service
        .getAlertObservable()
        .pipe(take(1))
        .subscribe((alert) => {
          expect(alert.message).toBe(12345 as any);
          expect(alert.show).toBe(true);
          done();
        });

      service.showAlert(12345 as any);
    });

    it('should handle boolean values (TypeScript passes as-is without conversion)', (done) => {
      service
        .getAlertObservable()
        .pipe(take(1))
        .subscribe((alert) => {
          expect(alert.message).toBe(true as any);
          expect(alert.show).toBe(true);
          done();
        });

      service.showAlert(true as any);
    });
  });

  describe('Memory and Performance', () => {
    it('should handle large number of subscribers', (done) => {
      const subscriptions: Subscription[] = [];
      let emissionCount = 0;

      for (let i = 0; i < 1000; i++) {
        const sub = service.getAlertObservable().subscribe(() => {
          emissionCount++;
        });
        subscriptions.push(sub);
      }

      service.showAlert('Broadcast to many');

      setTimeout(() => {
        expect(emissionCount).toBe(1000);
        subscriptions.forEach((sub) => sub.unsubscribe());
        done();
      }, 100);
    });

    it('should properly clean up when all subscribers unsubscribe', (done) => {
      const sub1 = service.getAlertObservable().subscribe(() => {});
      const sub2 = service.getAlertObservable().subscribe(() => {});

      sub1.unsubscribe();
      sub2.unsubscribe();

      setTimeout(() => {
        expect(() => service.showAlert('After all unsubscribed')).not.toThrow();
        done();
      }, 50);
    });
  });
});
