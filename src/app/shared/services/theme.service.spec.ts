import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { take } from 'rxjs/operators';

describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageSpy: jasmine.Spy;
  let getItemSpy: jasmine.Spy;
  let setItemSpy: jasmine.Spy;
  let removeItemSpy: jasmine.Spy;
  let osPrefersDark: boolean;
  let osChangeListener: ((event: { matches: boolean }) => void) | null;

  beforeEach(() => {
    osPrefersDark = false;
    osChangeListener = null;
    spyOn(window, 'matchMedia').and.callFake(
      () =>
        ({
          get matches() {
            return osPrefersDark;
          },
          addEventListener: (_: string, listener: any) => {
            osChangeListener = listener;
          },
          removeEventListener: () => {},
        } as any)
    );

    const store: { [key: string]: string } = {};

    getItemSpy = jasmine.createSpy('getItem').and.callFake((key: string) => {
      return store[key] || null;
    });

    setItemSpy = jasmine
      .createSpy('setItem')
      .and.callFake((key: string, value: string) => {
        store[key] = value;
      });

    removeItemSpy = jasmine
      .createSpy('removeItem')
      .and.callFake((key: string) => {
        delete store[key];
      });

    spyOnProperty(window, 'localStorage', 'get').and.returnValue({
      getItem: getItemSpy,
      setItem: setItemSpy,
      removeItem: removeItemSpy,
      clear: jasmine.createSpy('clear'),
      length: 0,
      key: jasmine.createSpy('key'),
    } as any);

    spyOn(document.documentElement.classList, 'toggle');
  });

  afterEach(() => {
    // clean up any service instance
    if (service) {
      service = null as any;
    }
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
      expect(service).toBeTruthy();
    });

    it('should be provided in root', () => {
      TestBed.configureTestingModule({});
      const service1 = TestBed.inject(ThemeService);
      const service2 = TestBed.inject(ThemeService);
      expect(service1).toBe(service2);
    });

    it('should have isDarkTheme$ observable', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
      expect(service.isDarkTheme$).toBeDefined();
      expect(typeof service.isDarkTheme$.subscribe).toBe('function');
    });

    it('should have private isDarkTheme BehaviorSubject', () => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
      expect(service['isDarkTheme']).toBeDefined();
      expect(service['isDarkTheme'].value).toBeDefined();
    });
  });

  describe('Constructor - Default Light Theme', () => {
    it('should initialize with light theme when no saved theme exists', () => {
      getItemSpy.and.returnValue(null);

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(getItemSpy).toHaveBeenCalledWith('theme');
      expect(service['isDarkTheme'].value).toBe(false);
    });

    it('should apply light theme class when no saved theme exists', () => {
      getItemSpy.and.returnValue(null);

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'dark-theme',
        false
      );
    });

    it('should not save a theme until the visitor chooses one', () => {
      getItemSpy.and.returnValue(null);

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(setItemSpy).not.toHaveBeenCalled();
    });

    it('should emit false from isDarkTheme$ observable when no saved theme exists', (done) => {
      getItemSpy.and.returnValue(null);

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      service.isDarkTheme$.pipe(take(1)).subscribe((isDark) => {
        expect(isDark).toBe(false);
        done();
      });
    });

    it('should initialize with light theme when saved theme is "light"', () => {
      getItemSpy.and.returnValue('light');

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(false);
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'dark-theme',
        false
      );
    });

    it('should treat an empty saved theme as no choice', () => {
      getItemSpy.and.returnValue('');

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(false);
      expect(setItemSpy).not.toHaveBeenCalled();
    });

    it('should default to light theme for any non-"dark" value', () => {
      getItemSpy.and.returnValue('invalid-theme');

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(false);
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'dark-theme',
        false
      );
    });
  });

  describe('Constructor - OS preference', () => {
    it('should start dark on a first visit when the OS prefers dark', () => {
      getItemSpy.and.returnValue(null);
      osPrefersDark = true;

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(true);
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'dark-theme',
        true
      );
      expect(setItemSpy).not.toHaveBeenCalled();
    });

    it('should keep a saved "light" choice even when the OS prefers dark', () => {
      getItemSpy.and.returnValue('light');
      osPrefersDark = true;

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(false);
    });

    it('should keep a saved "dark" choice even when the OS prefers light', () => {
      getItemSpy.and.returnValue('dark');
      osPrefersDark = false;

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(true);
    });

    it('should follow the OS for an unrecognised saved value', () => {
      getItemSpy.and.returnValue('Dark');
      osPrefersDark = true;

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(true);
    });

    it('should follow a live OS change until the visitor chooses', () => {
      getItemSpy.and.returnValue(null);

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
      expect(service['isDarkTheme'].value).toBe(false);

      osChangeListener!({ matches: true });
      expect(service['isDarkTheme'].value).toBe(true);

      osChangeListener!({ matches: false });
      expect(service['isDarkTheme'].value).toBe(false);
    });

    it('should stop following the OS after the visitor toggles', () => {
      getItemSpy.and.returnValue(null);

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      service.toggleTheme(); // visitor picks dark
      osChangeListener!({ matches: false });

      expect(service['isDarkTheme'].value).toBe(true);
    });

    it('should not listen for OS changes when a theme was saved', () => {
      getItemSpy.and.returnValue('light');

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(osChangeListener).toBeNull();
    });
  });

  describe('Constructor - Dark Theme', () => {
    it('should initialize with dark theme when saved theme is "dark"', () => {
      getItemSpy.and.returnValue('dark');

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(getItemSpy).toHaveBeenCalledWith('theme');
      expect(service['isDarkTheme'].value).toBe(true);
    });

    it('should apply dark theme class when saved theme is "dark"', () => {
      getItemSpy.and.returnValue('dark');

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'dark-theme',
        true
      );
    });

    it('should NOT save theme to localStorage when dark theme already saved', () => {
      getItemSpy.and.returnValue('dark');
      setItemSpy.calls.reset();

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(setItemSpy).not.toHaveBeenCalled();
    });

    it('should emit true from isDarkTheme$ observable when saved theme is "dark"', (done) => {
      getItemSpy.and.returnValue('dark');

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      service.isDarkTheme$.pipe(take(1)).subscribe((isDark) => {
        expect(isDark).toBe(true);
        done();
      });
    });

    it('should handle "dark" with mixed case strictly', () => {
      getItemSpy.and.returnValue('Dark');
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
      expect(service['isDarkTheme'].value).toBe(false);
    });

    it('should handle "dark" with whitespace strictly', () => {
      getItemSpy.and.returnValue(' dark ');
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
      expect(service['isDarkTheme'].value).toBe(false);
    });
  });

  describe('toggleTheme', () => {
    beforeEach(() => {
      getItemSpy.and.returnValue(null);
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
      (document.documentElement.classList.toggle as jasmine.Spy).calls.reset();
      setItemSpy.calls.reset();
    });

    it('should toggle from light to dark theme', () => {
      service.toggleTheme();
      expect(service['isDarkTheme'].value).toBe(true);
    });

    it('should toggle from dark to light theme', () => {
      // first toggle to dark
      service.toggleTheme();
      // then toggle back to light
      service.toggleTheme();
      expect(service['isDarkTheme'].value).toBe(false);
    });

    it('should apply dark theme class when toggling to dark', () => {
      service.toggleTheme();

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'dark-theme',
        true
      );
    });

    it('should apply light theme class when toggling to light', () => {
      service.toggleTheme(); // to dark
      (document.documentElement.classList.toggle as jasmine.Spy).calls.reset();
      service.toggleTheme(); // to light

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'dark-theme',
        false
      );
    });

    it('should save "dark" to localStorage when toggling to dark', () => {
      service.toggleTheme();

      expect(setItemSpy).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should save "light" to localStorage when toggling to light', () => {
      service.toggleTheme(); // to dark
      setItemSpy.calls.reset();
      service.toggleTheme(); // to light
      expect(setItemSpy).toHaveBeenCalledWith('theme', 'light');
    });

    it('should emit new theme value through isDarkTheme$ observable when toggling to dark', (done) => {
      let emissionCount = 0;
      const emissions: boolean[] = [];

      service.isDarkTheme$.subscribe((isDark) => {
        emissions.push(isDark);
        emissionCount++;
        if (emissionCount === 2) {
          expect(emissions).toEqual([false, true]);
          done();
        }
      });

      service.toggleTheme();
    });

    it('should emit new theme value through isDarkTheme$ observable when toggling to light', (done) => {
      let emissionCount = 0;
      const emissions: boolean[] = [];

      service.isDarkTheme$.subscribe((isDark) => {
        emissions.push(isDark);
        emissionCount++;
        if (emissionCount === 3) {
          expect(emissions).toEqual([false, true, false]);
          done();
        }
      });

      service.toggleTheme(); // to dark
      service.toggleTheme(); // to light
    });

    it('should handle multiple rapid toggles correctly', () => {
      for (let i = 0; i < 10; i++) {
        service.toggleTheme();
      }

      // after 10 toggles, the theme should be back to light
      expect(service['isDarkTheme'].value).toBe(false);
    });

    it('should call localStorage.setItem on each toggle', () => {
      service.toggleTheme();
      service.toggleTheme();
      service.toggleTheme();

      expect(setItemSpy).toHaveBeenCalledTimes(3);
    });

    it('should call applyTheme on each toggle', () => {
      service.toggleTheme();
      service.toggleTheme();

      expect(document.documentElement.classList.toggle).toHaveBeenCalledTimes(
        2
      );
    });

    it('should maintain correct state across multiple subscribers', (done) => {
      const subscriber1Values: boolean[] = [];
      const subscriber2Values: boolean[] = [];

      service.isDarkTheme$.subscribe((isDark) => {
        subscriber1Values.push(isDark);
      });

      service.isDarkTheme$.subscribe((isDark) => {
        subscriber2Values.push(isDark);
        if (subscriber2Values.length === 3) {
          expect(subscriber1Values).toEqual([false, true, false]);
          expect(subscriber2Values).toEqual([false, true, false]);
          done();
        }
      });

      service.toggleTheme();
      service.toggleTheme();
    });
  });

  describe('applyTheme', () => {
    beforeEach(() => {
      getItemSpy.and.returnValue(null);
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
      (document.documentElement.classList.toggle as jasmine.Spy).calls.reset();
    });

    it('should be called with true when applying dark theme', () => {
      service['applyTheme'](true);

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'dark-theme',
        true
      );
    });

    it('should be called with false when applying light theme', () => {
      service['applyTheme'](false);

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'dark-theme',
        false
      );
    });

    it('should toggle the correct CSS class on document root', () => {
      service['applyTheme'](true);

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
        'dark-theme',
        true
      );
      expect(
        document.documentElement.classList.toggle
      ).not.toHaveBeenCalledWith('light-theme', jasmine.any(Boolean));
    });

    it('should be called exactly once per toggle', () => {
      service.toggleTheme();

      expect(document.documentElement.classList.toggle).toHaveBeenCalledTimes(
        1
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete theme toggle cycle', (done) => {
      getItemSpy.and.returnValue(null);
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      const emissions: boolean[] = [];

      service.isDarkTheme$.subscribe((isDark) => {
        emissions.push(isDark);
        if (emissions.length === 4) {
          expect(emissions).toEqual([false, true, false, true]);
          done();
        }
      });

      service.toggleTheme(); // to dark
      service.toggleTheme(); // to light
      service.toggleTheme(); // to dark
    });

    it('should persist theme across toggles', () => {
      getItemSpy.and.returnValue(null);
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
      setItemSpy.calls.reset();

      service.toggleTheme();
      expect(setItemSpy).toHaveBeenCalledWith('theme', 'dark');

      service.toggleTheme();
      expect(setItemSpy).toHaveBeenCalledWith('theme', 'light');
    });

    it('should maintain theme state consistency between observable and BehaviorSubject', () => {
      getItemSpy.and.returnValue('dark');
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(true);

      service.isDarkTheme$.pipe(take(1)).subscribe((isDark) => {
        expect(isDark).toBe(true);
        expect(isDark).toBe(service['isDarkTheme'].value);
      });
    });

    it('should work correctly when initialized with dark theme and then toggled', (done) => {
      getItemSpy.and.returnValue('dark');
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      const emissions: boolean[] = [];

      service.isDarkTheme$.subscribe((isDark) => {
        emissions.push(isDark);
        if (emissions.length === 2) {
          expect(emissions).toEqual([true, false]);
          done();
        }
      });

      service.toggleTheme(); // to light
    });
  });

  describe('Edge Cases', () => {
    it('should handle localStorage.getItem returning null', () => {
      getItemSpy.and.returnValue(null);

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(false);
    });

    it('should handle localStorage.getItem returning undefined', () => {
      getItemSpy.and.returnValue(undefined);

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(false);
    });

    it('should fall back to the OS setting when localStorage.getItem throws', () => {
      getItemSpy.and.throwError('localStorage not available');
      osPrefersDark = true;

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(true);
    });

    it('should still switch themes when localStorage.setItem throws', () => {
      getItemSpy.and.returnValue(null);
      setItemSpy.and.throwError('quota exceeded');

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(() => service.toggleTheme()).not.toThrow();
      expect(service['isDarkTheme'].value).toBe(true);
    });

    it('should handle localStorage.setItem being called successfully', () => {
      getItemSpy.and.returnValue(null);

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(() => service.toggleTheme()).not.toThrow();
    });

    it('should handle document.documentElement being available', () => {
      getItemSpy.and.returnValue(null);

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(document.documentElement).toBeDefined();
      expect(document.documentElement.classList).toBeDefined();
    });

    it('should handle numeric values in localStorage', () => {
      getItemSpy.and.returnValue('123');

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(false);
    });

    it('should handle boolean values in localStorage', () => {
      getItemSpy.and.returnValue('true');

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(false);
    });

    it('should handle JSON values in localStorage', () => {
      getItemSpy.and.returnValue('{"theme":"dark"}');

      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      expect(service['isDarkTheme'].value).toBe(false);
    });
  });

  describe('Observable Behavior', () => {
    beforeEach(() => {
      getItemSpy.and.returnValue(null);
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
    });

    it('should emit current value immediately to new subscribers (BehaviorSubject)', (done) => {
      service.toggleTheme(); // set to dark

      service.isDarkTheme$.pipe(take(1)).subscribe((isDark) => {
        expect(isDark).toBe(true);
        done();
      });
    });

    it('should allow late subscribers to get current theme state', (done) => {
      service.toggleTheme(); // to dark
      service.toggleTheme(); // to light

      setTimeout(() => {
        service.isDarkTheme$.pipe(take(1)).subscribe((isDark) => {
          expect(isDark).toBe(false);
          done();
        });
      }, 50);
    });

    it('should support multiple concurrent subscribers', (done) => {
      let count = 0;
      const subscriber1Values: boolean[] = [];
      const subscriber2Values: boolean[] = [];
      const subscriber3Values: boolean[] = [];

      service.isDarkTheme$.subscribe((v) => subscriber1Values.push(v));
      service.isDarkTheme$.subscribe((v) => subscriber2Values.push(v));
      service.isDarkTheme$.subscribe((v) => {
        subscriber3Values.push(v);
        count++;
        if (count === 2) {
          expect(subscriber1Values).toEqual([false, true]);
          expect(subscriber2Values).toEqual([false, true]);
          expect(subscriber3Values).toEqual([false, true]);
          done();
        }
      });

      service.toggleTheme();
    });

    it('should continue emitting after a subscriber unsubscribes', (done) => {
      const values: boolean[] = [];

      const sub1 = service.isDarkTheme$.subscribe((v) => values.push(v));

      service.toggleTheme(); // to dark
      sub1.unsubscribe();

      service.isDarkTheme$.subscribe((v) => {
        if (values.length === 2 && v === false) {
          expect(values).toEqual([false, true]);
          done();
        }
      });

      service.toggleTheme(); // to light
    });
  });

  describe('Memory and Performance', () => {
    it('should handle many toggle operations', () => {
      getItemSpy.and.returnValue(null);
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      for (let i = 0; i < 1000; i++) {
        service.toggleTheme();
      }

      expect(service['isDarkTheme'].value).toBe(false);
    });

    it('should not leak memory with many subscribers', () => {
      getItemSpy.and.returnValue(null);
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);

      const subscriptions = [];
      for (let i = 0; i < 100; i++) {
        subscriptions.push(service.isDarkTheme$.subscribe(() => {}));
      }

      subscriptions.forEach((sub) => sub.unsubscribe());

      expect(() => service.toggleTheme()).not.toThrow();
    });

    it('should handle rapid consecutive toggles', () => {
      getItemSpy.and.returnValue(null);
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
      const initialValue = service['isDarkTheme'].value;

      service.toggleTheme();
      service.toggleTheme();
      service.toggleTheme();
      service.toggleTheme();

      expect(service['isDarkTheme'].value).toBe(initialValue);
    });
  });
});
