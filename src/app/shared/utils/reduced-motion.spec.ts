import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { prefersReducedMotion } from './reduced-motion';

describe('prefersReducedMotion', () => {
  const mockMatchMedia = (matches: boolean) =>
    spyOn(window, 'matchMedia').and.returnValue({ matches } as MediaQueryList);

  it('is true when the system asks for reduced motion', () => {
    const spy = mockMatchMedia(true);

    expect(prefersReducedMotion()).toBeTrue();
    expect(spy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('is false when it does not', () => {
    mockMatchMedia(false);

    expect(prefersReducedMotion()).toBeFalse();
  });

  it('is false where matchMedia is unavailable', () => {
    const original = window.matchMedia;
    (window as any).matchMedia = undefined;
    try {
      expect(prefersReducedMotion()).toBeFalse();
    } finally {
      window.matchMedia = original;
    }
  });
});

describe('Angular animations and disableAnimations', () => {
  @Component({
    selector: 'app-slide-probe',
    template: '<div class="probe" *ngIf="open" @slide>content</div>',
    animations: [
      trigger('slide', [
        transition(':enter', [
          style({ transform: 'translateY(-20px)', opacity: 0 }),
          animate('400ms ease-out', style({ transform: 'none', opacity: 1 })),
        ]),
      ]),
    ],
  })
  class SlideProbeComponent {
    open = false;
  }

  const showProbe = async (disableAnimations: boolean) => {
    TestBed.configureTestingModule({
      declarations: [SlideProbeComponent],
      imports: [BrowserAnimationsModule.withConfig({ disableAnimations })],
    });
    const fixture = TestBed.createComponent(SlideProbeComponent);
    fixture.componentInstance.open = true;
    fixture.detectChanges();
    await fixture.whenStable();
    const probe = fixture.nativeElement.querySelector('.probe') as HTMLElement;
    return { fixture, probe, animations: probe.getAnimations() };
  };

  it('plays the animation by default (control)', async () => {
    const { fixture, animations } = await showProbe(false);

    expect(animations.length).toBeGreaterThan(0);
    fixture.destroy();
  });

  it('plays no animation, but still renders the content, when disabled', async () => {
    const { fixture, probe, animations } = await showProbe(true);

    expect(probe).toBeTruthy();
    expect(probe.textContent).toContain('content');
    expect(animations.length).toBe(0);
    fixture.destroy();
  });
});
