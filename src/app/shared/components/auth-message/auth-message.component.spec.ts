import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { AuthMessageComponent } from './auth-message.component';
import { AuthMessageService } from '../../services/auth-message.service';

describe('AuthMessageComponent', () => {
  let fixture: ComponentFixture<AuthMessageComponent>;
  let component: AuthMessageComponent;
  let show$: BehaviorSubject<boolean>;
  let service: {
    showMessage$: BehaviorSubject<boolean>;
    continueToAuth: jasmine.Spy;
    cancelAutoContinue: jasmine.Spy;
  };

  const el = (selector: string): HTMLElement | null =>
    fixture.nativeElement.querySelector(selector);

  const open = () => {
    show$.next(true);
    fixture.detectChanges();
  };

  beforeEach(() => {
    show$ = new BehaviorSubject<boolean>(false);
    service = {
      showMessage$: show$,
      continueToAuth: jasmine.createSpy('continueToAuth'),
      cancelAutoContinue: jasmine.createSpy('cancelAutoContinue'),
    };

    TestBed.configureTestingModule({
      imports: [AuthMessageComponent],
      providers: [
        { provide: AuthMessageService, useValue: service },
        provideNoopAnimations(),
      ],
    });

    fixture = TestBed.createComponent(AuthMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('dialog semantics', () => {
    it('renders nothing until the tour is shown', () => {
      expect(el('.auth-message-overlay')).toBeNull();
    });

    it('is a single modal dialog with an accessible name', () => {
      open();

      const dialogs = fixture.nativeElement.querySelectorAll('[role="dialog"]');
      expect(dialogs.length).toBe(1);
      expect(dialogs[0].classList).toContain('auth-message-content');
      expect(dialogs[0].getAttribute('aria-modal')).toBe('true');
      expect(dialogs[0].getAttribute('aria-label')).toBe('Welcome tour');
      expect(el('.auth-message-overlay')!.hasAttribute('role')).toBeFalse();
    });

    it('moves focus to the Get Started button, whose name matches its label', () => {
      open();

      const button = el('.continue-button')!;
      expect(document.activeElement).toBe(button);
      expect(button.hasAttribute('aria-label')).toBeFalse();
    });

    it('does not cancel the redirect just because focus moved in', () => {
      open();

      expect(service.cancelAutoContinue).not.toHaveBeenCalled();
    });

    it('continues to sign-in on Escape, once', () => {
      open();

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      );

      expect(service.continueToAuth).toHaveBeenCalledTimes(1);
    });
  });

  describe('autoplay', () => {
    it('advances once, then stops after showing every slide', fakeAsync(() => {
      open();
      expect(component.autoPlaying).toBeTrue();

      tick(5000);
      expect(component.currentSlide).toBe(1);

      tick(5000);
      expect(component.currentSlide).toBe(1);
      expect(component.autoPlaying).toBeFalse();

      tick(20000);
      expect(component.currentSlide).toBe(1);
      fixture.destroy();
    }));

    it('does not announce slide changes the visitor did not ask for', fakeAsync(() => {
      open();

      tick(5000);

      expect(component.announcement).toBe('');
      fixture.destroy();
    }));

    it('announces slide changes the visitor asks for', () => {
      open();

      component.nextSlide();
      fixture.detectChanges();

      expect(el('[role="status"]')!.textContent).toContain(
        'Showing slide 2 of 2: Features'
      );
    });

    it('pauses while the pointer is over the deck', fakeAsync(() => {
      open();

      component.pauseAutoPlay();
      tick(15000);
      expect(component.currentSlide).toBe(0);

      component.resumeAutoPlay();
      tick(5000);
      expect(component.currentSlide).toBe(1);
      fixture.destroy();
    }));

    it('pauses while a control in the deck has keyboard focus', fakeAsync(() => {
      open();
      const deck = el('.demo-deck')!;
      const control = el('.autoplay-toggle')!;
      spyOn(control, 'matches').and.callFake(
        (selector: string) => selector === ':focus-visible'
      );

      control.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      tick(15000);
      expect(component.currentSlide).toBe(0);

      deck.dispatchEvent(
        new FocusEvent('focusout', { bubbles: true, relatedTarget: null })
      );
      tick(5000);
      expect(component.currentSlide).toBe(1);
      fixture.destroy();
    }));

    it('is not paused by focus that did not come from the keyboard', fakeAsync(() => {
      open();
      const control = el('.autoplay-toggle')!;
      spyOn(control, 'matches').and.returnValue(false);

      control.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      tick(5000);

      expect(component.currentSlide).toBe(1);
      fixture.destroy();
    }));

    it('does not start for visitors who prefer reduced motion', fakeAsync(() => {
      spyOn(window, 'matchMedia').and.returnValue({
        matches: true,
      } as MediaQueryList);

      open();
      tick(20000);

      expect(component.autoPlaying).toBeFalse();
      expect(component.currentSlide).toBe(0);
      fixture.destroy();
    }));

    it('starts again from the first slide each time the tour opens', fakeAsync(() => {
      open();
      tick(10000);
      expect(component.autoPlaying).toBeFalse();

      show$.next(false);
      show$.next(true);
      fixture.detectChanges();

      expect(component.currentSlide).toBe(0);
      expect(component.autoPlaying).toBeTrue();
      tick(5000);
      expect(component.currentSlide).toBe(1);
      fixture.destroy();
    }));
  });

  describe('pause and play button', () => {
    const toggle = () => el('.autoplay-toggle') as HTMLButtonElement;

    it('is a named button that reflects the current state', () => {
      open();
      expect(toggle().getAttribute('aria-label')).toBe('Pause slideshow');

      toggle().click();
      fixture.detectChanges();

      expect(toggle().getAttribute('aria-label')).toBe('Play slideshow');
    });

    it('stops the slideshow when paused and resumes when played', fakeAsync(() => {
      open();

      toggle().click();
      tick(15000);
      expect(component.currentSlide).toBe(0);

      toggle().click();
      tick(5000);
      expect(component.currentSlide).toBe(1);
      fixture.destroy();
    }));

    it('plays from the beginning when it was left on the last slide', fakeAsync(() => {
      open();
      tick(10000);
      expect(component.currentSlide).toBe(1);

      toggle().click();

      expect(component.currentSlide).toBe(0);
      expect(component.autoPlaying).toBeTrue();
      tick(5000);
      fixture.destroy();
    }));
  });

  describe('redirect timer', () => {
    it('is cancelled by a pointer press inside the tour', () => {
      open();

      el('.demo-deck')!.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true })
      );

      expect(service.cancelAutoContinue).toHaveBeenCalled();
    });

    it('is cancelled by a key press inside the tour', () => {
      open();

      el('.continue-button')!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      );

      expect(service.cancelAutoContinue).toHaveBeenCalled();
    });
  });
});
