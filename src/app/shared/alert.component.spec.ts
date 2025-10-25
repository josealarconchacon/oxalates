import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertComponent } from './alert.component';
import { AlertService } from './alert-service/alert.service';
import { Subject, of } from 'rxjs';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;
  let alertService: jasmine.SpyObj<AlertService>;
  let alertSubject: Subject<{ message: string }>;

  beforeEach(async () => {
    alertSubject = new Subject<{ message: string }>();

    const alertServiceSpy = jasmine.createSpyObj('AlertService', [
      'getAlertObservable',
      'closeAlert',
    ]);
    alertServiceSpy.getAlertObservable.and.returnValue(
      alertSubject.asObservable()
    );

    await TestBed.configureTestingModule({
      declarations: [AlertComponent],
      providers: [{ provide: AlertService, useValue: alertServiceSpy }],
    }).compileComponents();

    alertService = TestBed.inject(AlertService) as jasmine.SpyObj<AlertService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default message as empty string', () => {
      expect(component.message).toBe('');
    });

    it('should have isVisible as false by default', () => {
      expect(component.isVisible).toBe(false);
    });

    it('should inject AlertService', () => {
      expect(alertService).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    it('should subscribe to alertService getAlertObservable', () => {
      fixture.detectChanges();
      expect(alertService.getAlertObservable).toHaveBeenCalled();
    });

    it('should update message when alert observable emits with a message', () => {
      fixture.detectChanges();

      const testMessage = 'Test alert message';
      alertSubject.next({ message: testMessage });

      expect(component.message).toBe(testMessage);
    });

    it('should set isVisible to true when alert observable emits with a non-empty message', () => {
      fixture.detectChanges();

      alertSubject.next({ message: 'Some message' });

      expect(component.isVisible).toBe(true);
    });

    it('should set isVisible to false when alert observable emits with an empty message', () => {
      fixture.detectChanges();

      alertSubject.next({ message: '' });

      expect(component.isVisible).toBe(false);
    });

    it('should set isVisible to false when alert observable emits with null message', () => {
      fixture.detectChanges();

      alertSubject.next({ message: null as any });

      expect(component.isVisible).toBe(false);
    });

    it('should set isVisible to false when alert observable emits with undefined message', () => {
      fixture.detectChanges();

      alertSubject.next({ message: undefined as any });

      expect(component.isVisible).toBe(false);
    });

    it('should handle multiple emissions from alert observable', () => {
      fixture.detectChanges();

      alertSubject.next({ message: 'First message' });
      expect(component.message).toBe('First message');
      expect(component.isVisible).toBe(true);

      alertSubject.next({ message: 'Second message' });
      expect(component.message).toBe('Second message');
      expect(component.isVisible).toBe(true);

      alertSubject.next({ message: '' });
      expect(component.message).toBe('');
      expect(component.isVisible).toBe(false);
    });

    it('should update message with whitespace-only string', () => {
      fixture.detectChanges();

      alertSubject.next({ message: '   ' });

      expect(component.message).toBe('   ');
      expect(component.isVisible).toBe(true);
    });
  });

  describe('@Input() message', () => {
    it('should accept message input from parent component', () => {
      component.message = 'Input message';
      fixture.detectChanges();

      expect(component.message).toBe('Input message');
    });

    it('should allow message to be set before ngOnInit', () => {
      component.message = 'Pre-init message';
      expect(component.message).toBe('Pre-init message');

      fixture.detectChanges();
      expect(component.message).toBe('Pre-init message');
    });

    it('should override input message when observable emits', () => {
      component.message = 'Input message';
      fixture.detectChanges();

      alertSubject.next({ message: 'Observable message' });

      expect(component.message).toBe('Observable message');
    });
  });

  describe('closeAlert', () => {
    it('should set isVisible to false', () => {
      component.isVisible = true;

      component.closeAlert();

      expect(component.isVisible).toBe(false);
    });

    it('should call alertService.closeAlert()', () => {
      component.closeAlert();

      expect(alertService.closeAlert).toHaveBeenCalled();
    });

    it('should call alertService.closeAlert() exactly once', () => {
      component.closeAlert();

      expect(alertService.closeAlert).toHaveBeenCalledTimes(1);
    });

    it('should set isVisible to false even if it was already false', () => {
      component.isVisible = false;

      component.closeAlert();

      expect(component.isVisible).toBe(false);
      expect(alertService.closeAlert).toHaveBeenCalled();
    });

    it('should not modify the message property', () => {
      component.message = 'Test message';

      component.closeAlert();

      expect(component.message).toBe('Test message');
    });

    it('should handle multiple calls correctly', () => {
      component.isVisible = true;

      component.closeAlert();
      expect(component.isVisible).toBe(false);
      expect(alertService.closeAlert).toHaveBeenCalledTimes(1);

      component.closeAlert();
      expect(component.isVisible).toBe(false);
      expect(alertService.closeAlert).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete alert lifecycle', () => {
      fixture.detectChanges();

      alertSubject.next({ message: 'Alert shown' });
      expect(component.isVisible).toBe(true);
      expect(component.message).toBe('Alert shown');

      component.closeAlert();
      expect(component.isVisible).toBe(false);
      expect(alertService.closeAlert).toHaveBeenCalled();
    });

    it('should allow reopening after closing', () => {
      fixture.detectChanges();

      alertSubject.next({ message: 'First alert' });
      expect(component.isVisible).toBe(true);

      component.closeAlert();
      expect(component.isVisible).toBe(false);

      alertSubject.next({ message: 'Second alert' });
      expect(component.isVisible).toBe(true);
      expect(component.message).toBe('Second alert');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long message strings', () => {
      fixture.detectChanges();

      const longMessage = 'a'.repeat(10000);
      alertSubject.next({ message: longMessage });

      expect(component.message).toBe(longMessage);
      expect(component.isVisible).toBe(true);
    });

    it('should handle special characters in message', () => {
      fixture.detectChanges();

      const specialMessage = '<script>alert("test")</script>';
      alertSubject.next({ message: specialMessage });

      expect(component.message).toBe(specialMessage);
      expect(component.isVisible).toBe(true);
    });

    it('should handle unicode characters in message', () => {
      fixture.detectChanges();

      const unicodeMessage = 'Alert!';
      alertSubject.next({ message: unicodeMessage });

      expect(component.message).toBe(unicodeMessage);
      expect(component.isVisible).toBe(true);
    });

    it('should handle rapid successive alerts', () => {
      fixture.detectChanges();

      for (let i = 0; i < 100; i++) {
        alertSubject.next({ message: `Alert ${i}` });
      }

      expect(component.message).toBe('Alert 99');
      expect(component.isVisible).toBe(true);
    });
  });

  describe('Memory and Subscription Management', () => {
    it('should not throw error when component is destroyed', () => {
      fixture.detectChanges();

      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });

    it('should still respond to observable after multiple detect changes', () => {
      fixture.detectChanges();
      fixture.detectChanges();
      fixture.detectChanges();
      alertSubject.next({ message: 'Test' });
      expect(component.message).toBe('Test');
      expect(component.isVisible).toBe(true);
    });
  });
});
