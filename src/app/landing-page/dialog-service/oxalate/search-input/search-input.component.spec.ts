import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchInputComponent } from './search-input.component';
import { ThemeService } from 'src/app/shared/services/theme.service';
import { Subject } from 'rxjs';
import { ElementRef, EventEmitter } from '@angular/core';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;
  let themeService: jasmine.SpyObj<ThemeService>;
  let themeSubject: Subject<boolean>;

  beforeEach(() => {
    themeSubject = new Subject<boolean>();

    themeService = jasmine.createSpyObj('ThemeService', [], {
      isDarkTheme$: themeSubject.asObservable(),
    });

    TestBed.configureTestingModule({
      imports: [SearchInputComponent],
      providers: [{ provide: ThemeService, useValue: themeService }],
    });

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    themeSubject.complete();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.searchQuery).toBe('');
      expect(component.isDarkTheme).toBe(false);
      expect(component['themeSubscription']).toBeNull();
      expect(component['isDoneKeyPressed']).toBe(false);
    });

    it('should have searchInputElement as undefined before view init', () => {
      expect(component.searchInputElement).toBeUndefined();
    });
  });

  describe('ngOnInit', () => {
    it('should subscribe to theme changes', () => {
      component.ngOnInit();

      themeSubject.next(true);
      expect(component.isDarkTheme).toBeTrue();

      themeSubject.next(false);
      expect(component.isDarkTheme).toBeFalse();
    });

    it('should store theme subscription', () => {
      component.ngOnInit();

      expect(component['themeSubscription']).not.toBeNull();
      expect(component['themeSubscription']?.closed).toBeFalse();
    });

    it('should update isDarkTheme immediately when theme emits', () => {
      component.ngOnInit();

      expect(component.isDarkTheme).toBe(false);

      themeSubject.next(true);
      expect(component.isDarkTheme).toBe(true);
    });

    it('should handle multiple theme changes', () => {
      component.ngOnInit();

      themeSubject.next(true);
      expect(component.isDarkTheme).toBeTrue();

      themeSubject.next(false);
      expect(component.isDarkTheme).toBeFalse();

      themeSubject.next(true);
      expect(component.isDarkTheme).toBeTrue();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from theme subscription if it exists', () => {
      component.ngOnInit();
      const subscription = component['themeSubscription'];
      spyOn(subscription!, 'unsubscribe');

      component.ngOnDestroy();

      expect(subscription!.unsubscribe).toHaveBeenCalled();
    });

    it('should not throw error if subscription is null', () => {
      component['themeSubscription'] = null;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should handle case when subscription is already unsubscribed', () => {
      component.ngOnInit();
      component['themeSubscription']?.unsubscribe();

      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should close the subscription', () => {
      component.ngOnInit();

      component.ngOnDestroy();

      expect(component['themeSubscription']?.closed).toBeTrue();
    });
  });

  describe('onSearchQueryChange', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should emit searchQueryChange with current searchQuery', () => {
      spyOn(component.searchQueryChange, 'emit');
      component.searchQuery = 'test query';

      component.onSearchQueryChange('test query');

      expect(component.searchQueryChange.emit).toHaveBeenCalledWith(
        'test query'
      );
    });

    it('should emit empty string when searchQuery is empty', () => {
      spyOn(component.searchQueryChange, 'emit');
      component.searchQuery = '';

      component.onSearchQueryChange('');

      expect(component.searchQueryChange.emit).toHaveBeenCalledWith('');
    });

    it('should emit searchQueryChange only once per call', () => {
      spyOn(component.searchQueryChange, 'emit');
      component.searchQuery = 'test';

      component.onSearchQueryChange('test');

      expect(component.searchQueryChange.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit with updated searchQuery value', () => {
      spyOn(component.searchQueryChange, 'emit');

      component.searchQuery = 'first';
      component.onSearchQueryChange('first');
      expect(component.searchQueryChange.emit).toHaveBeenCalledWith('first');

      component.searchQuery = 'second';
      component.onSearchQueryChange('second');
      expect(component.searchQueryChange.emit).toHaveBeenCalledWith('second');
    });
  });

  describe('onClearSearch', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear searchQuery', () => {
      component.searchQuery = 'test query';

      component.onClearSearch();

      expect(component.searchQuery).toBe('');
    });

    it('should emit searchQueryChange with empty string', () => {
      spyOn(component.searchQueryChange, 'emit');
      component.searchQuery = 'test';

      component.onClearSearch();

      expect(component.searchQueryChange.emit).toHaveBeenCalledWith('');
    });

    it('should emit clearSearch event', () => {
      spyOn(component.clearSearch, 'emit');

      component.onClearSearch();

      expect(component.clearSearch.emit).toHaveBeenCalled();
    });

    it('should call all actions in correct order', () => {
      const searchQueryChangeSpy = spyOn(component.searchQueryChange, 'emit');
      const clearSearchSpy = spyOn(component.clearSearch, 'emit');
      component.searchQuery = 'test';

      component.onClearSearch();

      expect(component.searchQuery).toBe('');
      expect(searchQueryChangeSpy).toHaveBeenCalledBefore(clearSearchSpy);
    });

    it('should work when searchQuery is already empty', () => {
      spyOn(component.searchQueryChange, 'emit');
      spyOn(component.clearSearch, 'emit');
      component.searchQuery = '';

      component.onClearSearch();

      expect(component.searchQuery).toBe('');
      expect(component.searchQueryChange.emit).toHaveBeenCalledWith('');
      expect(component.clearSearch.emit).toHaveBeenCalled();
    });
  });

  describe('onResize', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call focusInput when searchQuery exists and isDoneKeyPressed is false', () => {
      spyOn(component, 'focusInput');
      component.searchQuery = 'test';
      component['isDoneKeyPressed'] = false;

      component.onResize();

      expect(component.focusInput).toHaveBeenCalled();
    });

    it('should not call focusInput when searchQuery is empty', () => {
      spyOn(component, 'focusInput');
      component.searchQuery = '';
      component['isDoneKeyPressed'] = false;

      component.onResize();

      expect(component.focusInput).not.toHaveBeenCalled();
    });

    it('should not call focusInput when isDoneKeyPressed is true', () => {
      spyOn(component, 'focusInput');
      component.searchQuery = 'test';
      component['isDoneKeyPressed'] = true;

      component.onResize();

      expect(component.focusInput).not.toHaveBeenCalled();
    });

    it('should not call focusInput when both conditions are false', () => {
      spyOn(component, 'focusInput');
      component.searchQuery = '';
      component['isDoneKeyPressed'] = true;

      component.onResize();

      expect(component.focusInput).not.toHaveBeenCalled();
    });
  });

  describe('onKeyDown', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set isDoneKeyPressed to true on Enter key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      component.onKeyDown(event);

      expect(component['isDoneKeyPressed']).toBeTrue();
    });

    it('should emit enterPressed event on Enter key', () => {
      spyOn(component.enterPressed, 'emit');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      component.onKeyDown(event);

      expect(component.enterPressed.emit).toHaveBeenCalled();
    });

    it('should set isDoneKeyPressed to true on Go key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Go' });

      component.onKeyDown(event);

      expect(component['isDoneKeyPressed']).toBeTrue();
    });

    it('should emit enterPressed event on Go key', () => {
      spyOn(component.enterPressed, 'emit');
      const event = new KeyboardEvent('keydown', { key: 'Go' });

      component.onKeyDown(event);

      expect(component.enterPressed.emit).toHaveBeenCalled();
    });

    it('should set isDoneKeyPressed to true on Search key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Search' });

      component.onKeyDown(event);

      expect(component['isDoneKeyPressed']).toBeTrue();
    });

    it('should emit enterPressed event on Search key', () => {
      spyOn(component.enterPressed, 'emit');
      const event = new KeyboardEvent('keydown', { key: 'Search' });

      component.onKeyDown(event);

      expect(component.enterPressed.emit).toHaveBeenCalled();
    });

    it('should set isDoneKeyPressed to true on Done key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Done' });

      component.onKeyDown(event);

      expect(component['isDoneKeyPressed']).toBeTrue();
    });

    it('should emit enterPressed event on Done key', () => {
      spyOn(component.enterPressed, 'emit');
      const event = new KeyboardEvent('keydown', { key: 'Done' });

      component.onKeyDown(event);

      expect(component.enterPressed.emit).toHaveBeenCalled();
    });

    it('should not set isDoneKeyPressed for regular keys', () => {
      component['isDoneKeyPressed'] = false;
      const event = new KeyboardEvent('keydown', { key: 'a' });

      component.onKeyDown(event);

      expect(component['isDoneKeyPressed']).toBeFalse();
    });

    it('should not emit enterPressed for regular keys', () => {
      spyOn(component.enterPressed, 'emit');
      const event = new KeyboardEvent('keydown', { key: 'a' });

      component.onKeyDown(event);

      expect(component.enterPressed.emit).not.toHaveBeenCalled();
    });

    it('should handle special keys without errors', () => {
      const keys = ['Shift', 'Control', 'Alt', 'Tab', 'Escape'];

      keys.forEach((key) => {
        const event = new KeyboardEvent('keydown', { key });
        expect(() => component.onKeyDown(event)).not.toThrow();
        expect(component['isDoneKeyPressed']).toBeFalse();
      });
    });
  });

  describe('onBlur', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call focusInput when isDoneKeyPressed is false and searchQuery exists', (done) => {
      spyOn(component, 'focusInput');
      component['isDoneKeyPressed'] = false;
      component.searchQuery = 'test';

      component.onBlur();

      setTimeout(() => {
        expect(component.focusInput).toHaveBeenCalled();
        done();
      }, 15);
    });

    it('should not call focusInput when isDoneKeyPressed is true', (done) => {
      spyOn(component, 'focusInput');
      component['isDoneKeyPressed'] = true;
      component.searchQuery = 'test';

      component.onBlur();

      setTimeout(() => {
        expect(component.focusInput).not.toHaveBeenCalled();
        done();
      }, 15);
    });

    it('should not call focusInput when searchQuery is empty', (done) => {
      spyOn(component, 'focusInput');
      component['isDoneKeyPressed'] = false;
      component.searchQuery = '';

      component.onBlur();

      setTimeout(() => {
        expect(component.focusInput).not.toHaveBeenCalled();
        done();
      }, 15);
    });

    it('should reset isDoneKeyPressed when it was true', () => {
      component['isDoneKeyPressed'] = true;
      component.searchQuery = 'test';

      component.onBlur();

      expect(component['isDoneKeyPressed']).toBeFalse();
    });

    it('should not reset isDoneKeyPressed when refocusing', (done) => {
      spyOn(component, 'focusInput');
      component['isDoneKeyPressed'] = false;
      component.searchQuery = 'test';

      component.onBlur();

      expect(component['isDoneKeyPressed']).toBeFalse();

      setTimeout(() => {
        done();
      }, 15);
    });

    it('should handle case when both searchQuery is empty and isDoneKeyPressed is true', () => {
      component['isDoneKeyPressed'] = true;
      component.searchQuery = '';

      component.onBlur();

      expect(component['isDoneKeyPressed']).toBeFalse();
    });
  });

  describe('focusInput', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should focus and click input using ViewChild when available', () => {
      const mockNativeElement = {
        focus: jasmine.createSpy('focus'),
        click: jasmine.createSpy('click'),
      };
      component.searchInputElement = {
        nativeElement: mockNativeElement,
      } as ElementRef;

      component.focusInput();

      expect(mockNativeElement.focus).toHaveBeenCalled();
      expect(mockNativeElement.click).toHaveBeenCalled();
    });

    it('should call focus before click on ViewChild element', () => {
      const callOrder: string[] = [];
      const mockNativeElement = {
        focus: jasmine
          .createSpy('focus')
          .and.callFake(() => callOrder.push('focus')),
        click: jasmine
          .createSpy('click')
          .and.callFake(() => callOrder.push('click')),
      };
      component.searchInputElement = {
        nativeElement: mockNativeElement,
      } as ElementRef;

      component.focusInput();

      expect(callOrder).toEqual(['focus', 'click']);
    });

    it('should use ElementRef to find input when ViewChild is not available', () => {
      const mockInputElement = {
        focus: jasmine.createSpy('focus'),
        click: jasmine.createSpy('click'),
      };
      const mockElementRef = {
        nativeElement: {
          querySelector: jasmine
            .createSpy('querySelector')
            .and.returnValue(mockInputElement),
        },
      };
      component.searchInputElement = undefined;
      (component as any).elementRef = mockElementRef;
      component.focusInput();

      expect(mockElementRef.nativeElement.querySelector).toHaveBeenCalledWith(
        'input'
      );
      expect(mockInputElement.focus).toHaveBeenCalled();
      expect(mockInputElement.click).toHaveBeenCalled();
    });

    it('should call focus before click on querySelector element', () => {
      const callOrder: string[] = [];
      const mockInputElement = {
        focus: jasmine
          .createSpy('focus')
          .and.callFake(() => callOrder.push('focus')),
        click: jasmine
          .createSpy('click')
          .and.callFake(() => callOrder.push('click')),
      };
      const mockElementRef = {
        nativeElement: {
          querySelector: jasmine
            .createSpy('querySelector')
            .and.returnValue(mockInputElement),
        },
      };
      component.searchInputElement = undefined;
      (component as any).elementRef = mockElementRef;

      component.focusInput();

      expect(callOrder).toEqual(['focus', 'click']);
    });

    it('should handle case when querySelector returns null', () => {
      const mockElementRef = {
        nativeElement: {
          querySelector: jasmine
            .createSpy('querySelector')
            .and.returnValue(null),
        },
      };
      component.searchInputElement = undefined;
      (component as any).elementRef = mockElementRef;

      expect(() => component.focusInput()).not.toThrow();
    });

    it('should prioritize ViewChild over querySelector', () => {
      const viewChildElement = {
        focus: jasmine.createSpy('vcFocus'),
        click: jasmine.createSpy('vcClick'),
      };
      const querySelectorElement = {
        focus: jasmine.createSpy('qsFocus'),
        click: jasmine.createSpy('qsClick'),
      };
      const mockElementRef = {
        nativeElement: {
          querySelector: jasmine
            .createSpy('querySelector')
            .and.returnValue(querySelectorElement),
        },
      };

      component.searchInputElement = {
        nativeElement: viewChildElement,
      } as ElementRef;
      (component as any).elementRef = mockElementRef;

      component.focusInput();

      expect(viewChildElement.focus).toHaveBeenCalled();
      expect(viewChildElement.click).toHaveBeenCalled();
      expect(querySelectorElement.focus).not.toHaveBeenCalled();
      expect(querySelectorElement.click).not.toHaveBeenCalled();
    });
  });

  describe('Input/Output Properties', () => {
    it('should accept searchQuery as input', () => {
      component.searchQuery = 'test input';

      expect(component.searchQuery).toBe('test input');
    });

    it('should have searchQueryChange EventEmitter', () => {
      expect(component.searchQueryChange).toBeDefined();
      expect(component.searchQueryChange instanceof EventEmitter).toBeTrue();
    });

    it('should have clearSearch EventEmitter', () => {
      expect(component.clearSearch).toBeDefined();
      expect(component.clearSearch instanceof EventEmitter).toBeTrue();
    });

    it('should have enterPressed EventEmitter', () => {
      expect(component.enterPressed).toBeDefined();
      expect(component.enterPressed instanceof EventEmitter).toBeTrue();
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle complete search workflow', () => {
      spyOn(component.searchQueryChange, 'emit');
      spyOn(component.clearSearch, 'emit');

      // User types
      component.searchQuery = 'test';
      component.onSearchQueryChange('test');
      expect(component.searchQueryChange.emit).toHaveBeenCalledWith('test');

      // User clears
      component.onClearSearch();
      expect(component.searchQuery).toBe('');
      expect(component.clearSearch.emit).toHaveBeenCalled();
    });

    it('should handle Enter key press workflow', () => {
      spyOn(component.enterPressed, 'emit');
      component['isDoneKeyPressed'] = false;

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onKeyDown(event);

      expect(component['isDoneKeyPressed']).toBeTrue();
      expect(component.enterPressed.emit).toHaveBeenCalled();
    });

    it('should handle blur after Enter key press', () => {
      spyOn(component, 'focusInput');
      component.searchQuery = 'test';

      // Press Enter
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onKeyDown(event);
      component.onBlur();
      expect(component['isDoneKeyPressed']).toBeFalse();
      expect(component.focusInput).not.toHaveBeenCalled();
    });

    it('should handle resize with active search', () => {
      spyOn(component, 'focusInput');
      component.searchQuery = 'test';
      component['isDoneKeyPressed'] = false;
      component.onResize();
      expect(component.focusInput).toHaveBeenCalled();
    });

    it('should maintain theme state throughout lifecycle', () => {
      component.ngOnInit();
      themeSubject.next(true);
      expect(component.isDarkTheme).toBeTrue();
      themeSubject.next(false);
      expect(component.isDarkTheme).toBeFalse();
      component.ngOnDestroy();
      expect(component['themeSubscription']?.closed).toBeTrue();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle rapid searchQuery changes', () => {
      spyOn(component.searchQueryChange, 'emit');

      component.searchQuery = 'a';
      component.onSearchQueryChange('a');
      component.searchQuery = 'ab';
      component.onSearchQueryChange('ab');
      component.searchQuery = 'abc';
      component.onSearchQueryChange('abc');

      expect(component.searchQueryChange.emit).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple Enter key presses', () => {
      spyOn(component.enterPressed, 'emit');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      component.onKeyDown(event);
      component.onKeyDown(event);
      component.onKeyDown(event);

      expect(component.enterPressed.emit).toHaveBeenCalledTimes(3);
      expect(component['isDoneKeyPressed']).toBeTrue();
    });

    it('should handle blur without prior keydown', () => {
      spyOn(component, 'focusInput');
      component.searchQuery = 'test';
      component['isDoneKeyPressed'] = false;

      expect(() => component.onBlur()).not.toThrow();
    });

    it('should handle focusInput when no input element exists', () => {
      component.searchInputElement = undefined;
      const mockElementRef = {
        nativeElement: {
          querySelector: jasmine
            .createSpy('querySelector')
            .and.returnValue(null),
        },
      };
      (component as any).elementRef = mockElementRef;

      expect(() => component.focusInput()).not.toThrow();
    });
  });
});
