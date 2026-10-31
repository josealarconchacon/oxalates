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

  describe('onSubmit', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should emit searchSubmitted when there is a query', () => {
      spyOn(component.searchSubmitted, 'emit');
      component.searchQuery = 'spinach';

      component.onSubmit();

      expect(component.searchSubmitted.emit).toHaveBeenCalledTimes(1);
    });

    it('should not emit searchSubmitted for an empty or blank query', () => {
      spyOn(component.searchSubmitted, 'emit');

      component.searchQuery = '';
      component.onSubmit();
      component.searchQuery = '   ';
      component.onSubmit();

      expect(component.searchSubmitted.emit).not.toHaveBeenCalled();
    });

    it('should put focus back in the field when there is nothing to search for', () => {
      spyOn(component, 'focusInput');
      component.searchQuery = '';

      component.onSubmit();

      expect(component.focusInput).toHaveBeenCalled();
    });

    it('should stop the browser from navigating away', () => {
      const event = new Event('submit', { cancelable: true });
      component.searchQuery = 'spinach';

      component.onSubmit(event);

      expect(event.defaultPrevented).toBeTrue();
    });

    it('should mark the field as submitted so a resize does not pull the keyboard back up', () => {
      spyOn(component, 'focusInput');
      component.searchQuery = 'spinach';

      component.onSubmit();
      component.onResize();

      expect(component.focusInput).not.toHaveBeenCalled();
    });
  });

  describe('search form (rendered)', () => {
    const button = (selector: string): HTMLButtonElement | null =>
      fixture.nativeElement.querySelector(selector);

    beforeEach(() => {
      fixture.detectChanges();
    });

    it('is a labelled search landmark', () => {
      const form: HTMLFormElement = fixture.nativeElement.querySelector('form');

      expect(form.getAttribute('role')).toBe('search');
      expect(form.getAttribute('aria-label')).toBeTruthy();
    });

    it('has a text-only Search submit button and no second magnifier', () => {
      const submit = button('button[type="submit"]')!;

      expect(submit.textContent!.trim()).toBe('Search');
      expect(submit.querySelector('svg')).toBeNull();
      expect(fixture.nativeElement.querySelectorAll('svg').length).toBe(1);
    });

    it('shows no clear button until there is text', () => {
      expect(button('.search-clear-button')).toBeNull();
    });

    it('shows a labelled clear button once there is text, and keeps Search', () => {
      component.searchQuery = 'kale';
      fixture.detectChanges();

      expect(button('.search-clear-button')!.getAttribute('aria-label')).toBe(
        'Clear search'
      );
      expect(button('button[type="submit"]')!.textContent!.trim()).toBe(
        'Search'
      );
    });

    it('clears the field and keeps focus there when the clear button is pressed', () => {
      spyOn(component.clearSearch, 'emit');
      spyOn(component, 'focusInput');
      component.searchQuery = 'kale';
      fixture.detectChanges();

      button('.search-clear-button')!.click();

      expect(component.searchQuery).toBe('');
      expect(component.clearSearch.emit).toHaveBeenCalled();
      expect(component.focusInput).toHaveBeenCalled();
    });

    it('submits when the Search button is pressed', () => {
      spyOn(component.searchSubmitted, 'emit');
      component.searchQuery = 'kale';
      fixture.detectChanges();

      button('button[type="submit"]')!.click();

      expect(component.searchSubmitted.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('onBlur', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('does not pull focus back into the field, on any screen size', (done) => {
      spyOn(component, 'focusInput');
      component.searchQuery = 'test';

      component.onBlur();

      setTimeout(() => {
        expect(component.focusInput).not.toHaveBeenCalled();
        done();
      }, 15);
    });

    it('forgets that the field was submitted', () => {
      component['isDoneKeyPressed'] = true;

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

    it('should have searchSubmitted EventEmitter', () => {
      expect(component.searchSubmitted).toBeDefined();
      expect(component.searchSubmitted instanceof EventEmitter).toBeTrue();
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

    it('should handle submit workflow', () => {
      spyOn(component.searchSubmitted, 'emit');
      component.searchQuery = 'test';
      component['isDoneKeyPressed'] = false;

      component.onSubmit();

      expect(component['isDoneKeyPressed']).toBeTrue();
      expect(component.searchSubmitted.emit).toHaveBeenCalled();
    });

    it('should handle blur after submitting', () => {
      spyOn(component, 'focusInput');
      component.searchQuery = 'test';

      component.onSubmit();
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

    it('should handle multiple submits', () => {
      spyOn(component.searchSubmitted, 'emit');
      component.searchQuery = 'test';

      component.onSubmit();
      component.onSubmit();
      component.onSubmit();

      expect(component.searchSubmitted.emit).toHaveBeenCalledTimes(3);
      expect(component['isDoneKeyPressed']).toBeTrue();
    });

    it('should handle blur without a prior submit', () => {
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
