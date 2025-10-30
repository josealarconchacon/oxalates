import { TestBed } from '@angular/core/testing';
import { HapticService } from './haptic.service';

fdescribe('HapticService', () => {
  let service: HapticService;
  let vibrateSpy: jasmine.Spy;
  let originalNavigator: Navigator;

  beforeEach(() => {
    // Save original navigator
    originalNavigator = window.navigator;

    // Create vibrate spy
    vibrateSpy = jasmine.createSpy('vibrate');
  });

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true
    });
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      // Mock navigator with vibrate support
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      expect(service).toBeTruthy();
    });

    it('should be provided in root', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      const service1 = TestBed.inject(HapticService);
      const service2 = TestBed.inject(HapticService);
      
      expect(service1).toBe(service2);
    });

    it('should set vibrationSupported to true when vibrate is available', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      expect(service['vibrationSupported']).toBe(true);
    });

    it('should set vibrationSupported to false when vibrate is not available', () => {
      // Create navigator without vibrate
      const navigatorWithoutVibrate = {} as Navigator;
      Object.defineProperty(window, 'navigator', {
        value: navigatorWithoutVibrate,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      expect(service['vibrationSupported']).toBe(false);
    });

    it('should detect vibrate support using "in" operator', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      expect('vibrate' in navigator).toBe(true);
      expect(service['vibrationSupported']).toBe(true);
    });
  });

  describe('light()', () => {
    it('should call navigator.vibrate with 10ms when supported', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.light();

      expect(vibrateSpy).toHaveBeenCalledWith(10);
    });

    it('should not call navigator.vibrate when not supported', () => {
      Object.defineProperty(window, 'navigator', {
        value: {} as Navigator,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.light();

      expect(vibrateSpy).not.toHaveBeenCalled();
    });

    it('should call vibrate exactly once per call', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.light();

      expect(vibrateSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple consecutive calls', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.light();
      service.light();
      service.light();

      expect(vibrateSpy).toHaveBeenCalledTimes(3);
      expect(vibrateSpy.calls.allArgs()).toEqual([[10], [10], [10]]);
    });
  });

  describe('medium()', () => {
    it('should call navigator.vibrate with 20ms when supported', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.medium();

      expect(vibrateSpy).toHaveBeenCalledWith(20);
    });

    it('should not call navigator.vibrate when not supported', () => {
      Object.defineProperty(window, 'navigator', {
        value: {} as Navigator,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.medium();

      expect(vibrateSpy).not.toHaveBeenCalled();
    });
  });

  describe('heavy()', () => {
    it('should call navigator.vibrate with 30ms when supported', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.heavy();

      expect(vibrateSpy).toHaveBeenCalledWith(30);
    });

    it('should not call navigator.vibrate when not supported', () => {
      Object.defineProperty(window, 'navigator', {
        value: {} as Navigator,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.heavy();

      expect(vibrateSpy).not.toHaveBeenCalled();
    });
  });

  describe('success()', () => {
    it('should call navigator.vibrate with double tap pattern when supported', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.success();

      expect(vibrateSpy).toHaveBeenCalledWith([10, 50, 10]);
    });

    it('should not call navigator.vibrate when not supported', () => {
      Object.defineProperty(window, 'navigator', {
        value: {} as Navigator,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.success();

      expect(vibrateSpy).not.toHaveBeenCalled();
    });

    it('should use correct pattern array format', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.success();

      const calledPattern = vibrateSpy.calls.mostRecent().args[0];
      expect(Array.isArray(calledPattern)).toBe(true);
      expect(calledPattern.length).toBe(3);
    });
  });

  describe('error()', () => {
    it('should call navigator.vibrate with triple tap pattern when supported', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.error();

      expect(vibrateSpy).toHaveBeenCalledWith([10, 30, 10, 30, 10]);
    });

    it('should not call navigator.vibrate when not supported', () => {
      Object.defineProperty(window, 'navigator', {
        value: {} as Navigator,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.error();

      expect(vibrateSpy).not.toHaveBeenCalled();
    });

    it('should use correct pattern array format', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.error();

      const calledPattern = vibrateSpy.calls.mostRecent().args[0];
      expect(Array.isArray(calledPattern)).toBe(true);
      expect(calledPattern.length).toBe(5);
    });
  });

  describe('warning()', () => {
    it('should call navigator.vibrate with 40ms when supported', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.warning();

      expect(vibrateSpy).toHaveBeenCalledWith(40);
    });

    it('should not call navigator.vibrate when not supported', () => {
      Object.defineProperty(window, 'navigator', {
        value: {} as Navigator,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.warning();

      expect(vibrateSpy).not.toHaveBeenCalled();
    });
  });

  describe('selection()', () => {
    it('should call navigator.vibrate with 5ms when supported', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.selection();

      expect(vibrateSpy).toHaveBeenCalledWith(5);
    });

    it('should not call navigator.vibrate when not supported', () => {
      Object.defineProperty(window, 'navigator', {
        value: {} as Navigator,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.selection();

      expect(vibrateSpy).not.toHaveBeenCalled();
    });
  });

  describe('impact()', () => {
    it('should call navigator.vibrate with 25ms when supported', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.impact();

      expect(vibrateSpy).toHaveBeenCalledWith(25);
    });

    it('should not call navigator.vibrate when not supported', () => {
      Object.defineProperty(window, 'navigator', {
        value: {} as Navigator,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.impact();

      expect(vibrateSpy).not.toHaveBeenCalled();
    });
  });

  describe('custom()', () => {
    it('should call navigator.vibrate with custom pattern when supported', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      const customPattern = [100, 200, 100, 200];
      service.custom(customPattern);

      expect(vibrateSpy).toHaveBeenCalledWith(customPattern);
    });

    it('should not call navigator.vibrate when not supported', () => {
      Object.defineProperty(window, 'navigator', {
        value: {} as Navigator,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.custom([100, 200]);

      expect(vibrateSpy).not.toHaveBeenCalled();
    });

    it('should handle empty array pattern', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.custom([]);

      expect(vibrateSpy).toHaveBeenCalledWith([]);
    });

    it('should handle single value pattern', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.custom([50]);

      expect(vibrateSpy).toHaveBeenCalledWith([50]);
    });

    it('should handle complex pattern arrays', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      const complexPattern = [10, 20, 30, 40, 50, 60, 70];
      service.custom(complexPattern);

      expect(vibrateSpy).toHaveBeenCalledWith(complexPattern);
    });

    it('should pass pattern array by reference', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      const pattern = [100, 200];
      service.custom(pattern);

      expect(vibrateSpy).toHaveBeenCalledWith(pattern);
      expect(vibrateSpy.calls.mostRecent().args[0]).toBe(pattern);
    });
  });

  describe('stop()', () => {
    it('should call navigator.vibrate with 0 to stop vibration when supported', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.stop();

      expect(vibrateSpy).toHaveBeenCalledWith(0);
    });

    it('should not call navigator.vibrate when not supported', () => {
      Object.defineProperty(window, 'navigator', {
        value: {} as Navigator,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.stop();

      expect(vibrateSpy).not.toHaveBeenCalled();
    });

    it('should be callable multiple times', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.stop();
      service.stop();

      expect(vibrateSpy).toHaveBeenCalledTimes(2);
      expect(vibrateSpy.calls.allArgs()).toEqual([[0], [0]]);
    });
  });

  describe('isSupported()', () => {
    it('should return true when vibrate is supported', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      expect(service.isSupported()).toBe(true);
    });

    it('should return false when vibrate is not supported', () => {
      Object.defineProperty(window, 'navigator', {
        value: {} as Navigator,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      expect(service.isSupported()).toBe(false);
    });

    it('should not call navigator.vibrate', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.isSupported();

      expect(vibrateSpy).not.toHaveBeenCalled();
    });

    it('should return consistent value across multiple calls', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      const result1 = service.isSupported();
      const result2 = service.isSupported();
      const result3 = service.isSupported();

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);
    });

    it('should handle sequence of different haptic patterns', () => {
      service.light();
      service.medium();
      service.heavy();

      expect(vibrateSpy).toHaveBeenCalledTimes(3);
      expect(vibrateSpy.calls.argsFor(0)).toEqual([10]);
      expect(vibrateSpy.calls.argsFor(1)).toEqual([20]);
      expect(vibrateSpy.calls.argsFor(2)).toEqual([30]);
    });

    it('should handle feedback patterns correctly', () => {
      service.success();
      service.error();
      service.warning();

      expect(vibrateSpy).toHaveBeenCalledTimes(3);
      expect(vibrateSpy.calls.argsFor(0)).toEqual([[10, 50, 10]]);
      expect(vibrateSpy.calls.argsFor(1)).toEqual([[10, 30, 10, 30, 10]]);
      expect(vibrateSpy.calls.argsFor(2)).toEqual([40]);
    });

    it('should handle mixed single and pattern vibrations', () => {
      service.selection();
      service.success();
      service.impact();
      service.error();

      expect(vibrateSpy).toHaveBeenCalledTimes(4);
    });

    it('should allow stopping vibration after starting', () => {
      service.heavy();
      service.stop();

      expect(vibrateSpy).toHaveBeenCalledTimes(2);
      expect(vibrateSpy.calls.mostRecent().args).toEqual([0]);
    });

    it('should handle custom pattern followed by preset', () => {
      service.custom([100, 200, 100]);
      service.light();

      expect(vibrateSpy).toHaveBeenCalledTimes(2);
      expect(vibrateSpy.calls.argsFor(0)).toEqual([[100, 200, 100]]);
      expect(vibrateSpy.calls.argsFor(1)).toEqual([10]);
    });
  });

  describe('Edge Cases', () => {
    it('should detect vibrate property even when set to null', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: null,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      // 'vibrate' in navigator returns true even if value is null
      expect(service.isSupported()).toBe(true);
      
      // Calling methods will throw because vibrate is not a function
      expect(() => service.light()).toThrow();
    });

    it('should handle navigator.vibrate being undefined', () => {
      const nav = { ...navigator };
      delete (nav as any).vibrate;
      
      Object.defineProperty(window, 'navigator', {
        value: nav,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      expect(() => service.light()).not.toThrow();
      expect(service.isSupported()).toBe(false);
    });

    it('should handle very large custom pattern arrays', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      const largePattern = new Array(100).fill(10);
      service.custom(largePattern);

      expect(vibrateSpy).toHaveBeenCalledWith(largePattern);
    });

    it('should handle zero duration patterns', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.custom([0, 0, 0]);

      expect(vibrateSpy).toHaveBeenCalledWith([0, 0, 0]);
    });

    it('should handle negative values in custom pattern', () => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      service.custom([-10, 20, -30]);

      expect(vibrateSpy).toHaveBeenCalledWith([-10, 20, -30]);
    });

    it('should handle calling all methods when not supported', () => {
      Object.defineProperty(window, 'navigator', {
        value: {} as Navigator,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);

      expect(() => {
        service.light();
        service.medium();
        service.heavy();
        service.success();
        service.error();
        service.warning();
        service.selection();
        service.impact();
        service.custom([10, 20]);
        service.stop();
      }).not.toThrow();

      expect(vibrateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Vibration Duration Consistency', () => {
    beforeEach(() => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);
    });

    it('should have selection as shortest duration', () => {
      service.selection();
      const selectionDuration = vibrateSpy.calls.mostRecent().args[0];
      
      vibrateSpy.calls.reset();
      service.light();
      const lightDuration = vibrateSpy.calls.mostRecent().args[0];

      expect(selectionDuration).toBeLessThan(lightDuration);
    });

    it('should have increasing durations: light < medium < heavy', () => {
      service.light();
      const lightDuration = vibrateSpy.calls.mostRecent().args[0];

      service.medium();
      const mediumDuration = vibrateSpy.calls.mostRecent().args[0];

      service.heavy();
      const heavyDuration = vibrateSpy.calls.mostRecent().args[0];

      expect(lightDuration).toBeLessThan(mediumDuration);
      expect(mediumDuration).toBeLessThan(heavyDuration);
    });

    it('should have warning as longest single vibration', () => {
      service.warning();
      const warningDuration = vibrateSpy.calls.mostRecent().args[0];

      service.heavy();
      const heavyDuration = vibrateSpy.calls.mostRecent().args[0];

      expect(warningDuration).toBeGreaterThan(heavyDuration);
    });
  });

  describe('Memory and Performance', () => {
    beforeEach(() => {
      Object.defineProperty(window.navigator, 'vibrate', {
        value: vibrateSpy,
        writable: true,
        configurable: true
      });

      TestBed.configureTestingModule({});
      service = TestBed.inject(HapticService);
    });

    it('should handle rapid consecutive calls without issues', () => {
      for (let i = 0; i < 1000; i++) {
        service.light();
      }

      expect(vibrateSpy).toHaveBeenCalledTimes(1000);
    });

    it('should not store vibration patterns in memory', () => {
      const pattern = [100, 200, 300];
      service.custom(pattern);

      // Modify original pattern
      pattern.push(400);

      // Call again - should use new pattern
      service.custom(pattern);

      expect(vibrateSpy.calls.mostRecent().args[0]).toEqual([100, 200, 300, 400]);
    });

    it('should handle all methods being called in sequence multiple times', () => {
      for (let i = 0; i < 10; i++) {
        service.light();
        service.medium();
        service.heavy();
        service.success();
        service.error();
        service.warning();
        service.selection();
        service.impact();
        service.custom([50]);
        service.stop();
      }

      expect(vibrateSpy).toHaveBeenCalledTimes(100);
    });
  });
});