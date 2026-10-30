import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthMessageService } from '../../services/auth-message.service';
import { DialogDirective } from '../../directives/dialog.directive';
import { prefersReducedMotion } from '../../utils/reduced-motion';
import {
  fadeInOut,
  slideAnimation,
  contentAnimation,
  indicatorPulse,
  pulseAnimation,
} from '../../animations/auth-message.animations';

@Component({
  selector: 'app-auth-message',
  standalone: true,
  imports: [CommonModule, DialogDirective],
  templateUrl: './auth-message.component.html',
  animations: [
    fadeInOut,
    slideAnimation,
    contentAnimation,
    indicatorPulse,
    pulseAnimation,
  ],
  styleUrls: ['./auth-message.component.css'],
})
export class AuthMessageComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  slides = ['Welcome', 'Features'];
  /** Polite message for the screen-reader live region. */
  announcement = '';
  /**
   * Whether the slideshow advances on its own. Off for visitors who prefer
   * reduced motion, and switched off for good once it has shown every slide.
   */
  autoPlaying = false;
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly SWIPE_THRESHOLD = 50;
  private keyboardListener: ((event: KeyboardEvent) => void) | null = null;
  private autoPlayInterval: any;
  private readonly SLIDE_INTERVAL = 5000; // 5 seconds between slides
  private pointerPaused = false;
  private focusPaused = false;
  private visibilitySub?: Subscription;

  constructor(
    public authMessageService: AuthMessageService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.setupKeyboardNavigation();
    // The component is mounted once for the whole app, so (re)start the
    // slideshow each time the tour opens rather than when the app loads.
    this.visibilitySub = this.authMessageService.showMessage$.subscribe(
      (visible) => {
        this.stopAutoPlay();
        if (visible) {
          this.currentSlide = 0;
          this.announcement = '';
          this.pointerPaused = false;
          this.focusPaused = false;
          if (!prefersReducedMotion()) {
            this.startAutoPlay();
          }
        }
      }
    );
  }

  ngOnDestroy() {
    this.removeKeyboardNavigation();
    this.stopAutoPlay();
    this.visibilitySub?.unsubscribe();
  }

  private setupKeyboardNavigation() {
    // Escape is handled by the dialog directive, which also closes only the
    // top-most dialog.
    this.keyboardListener = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          this.nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          this.previousSlide();
          break;
        case 'Home':
          event.preventDefault();
          this.goToSlide(0);
          break;
        case 'End':
          event.preventDefault();
          this.goToSlide(this.slides.length - 1);
          break;
      }
    };
    this.elementRef.nativeElement.addEventListener(
      'keydown',
      this.keyboardListener
    );
  }

  private removeKeyboardNavigation() {
    if (this.keyboardListener) {
      this.elementRef.nativeElement.removeEventListener(
        'keydown',
        this.keyboardListener
      );
      this.keyboardListener = null;
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchEndX = this.touchStartX;
  }

  onTouchMove(event: TouchEvent) {
    this.touchEndX = event.touches[0].clientX;
  }

  onTouchEnd() {
    const swipeDistance = this.touchEndX - this.touchStartX;
    if (Math.abs(swipeDistance) > this.SWIPE_THRESHOLD) {
      if (swipeDistance > 0 && this.currentSlide > 0) {
        this.previousSlide();
      } else if (
        swipeDistance < 0 &&
        this.currentSlide < this.slides.length - 1
      ) {
        this.nextSlide();
      }
    }
  }

  nextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
      this.announceSlideChange();
    }
  }

  previousSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.announceSlideChange();
    }
  }

  goToSlide(index: number) {
    if (index >= 0 && index < this.slides.length) {
      this.currentSlide = index;
      this.announceSlideChange();
    }
  }

  private announceSlideChange() {
    this.announcement = `Showing slide ${this.currentSlide + 1} of ${
      this.slides.length
    }: ${this.slides[this.currentSlide]}`;
  }

  onContinue() {
    this.authMessageService.continueToAuth();
  }

  /**
   * Any real interaction means the visitor is using the tour, so don't send
   * them away after a fixed time. Programmatic focus doesn't count, which is
   * why this listens for pointer and key events rather than focus.
   */
  @HostListener('pointerdown')
  @HostListener('keydown')
  onUserInteraction() {
    this.authMessageService.cancelAutoContinue();
  }

  private startAutoPlay() {
    this.autoPlaying = true;
    this.autoPlayInterval = setInterval(() => {
      if (this.pointerPaused || this.focusPaused) {
        return;
      }
      if (this.currentSlide < this.slides.length - 1) {
        // Not announced: the visitor didn't ask for this change.
        this.currentSlide++;
      } else {
        // Shown every slide once; stop moving things on their own.
        this.stopAutoPlay();
      }
    }, this.SLIDE_INTERVAL);
  }

  private stopAutoPlay() {
    this.autoPlaying = false;
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  /** Pause/play button. */
  toggleAutoPlay() {
    if (this.autoPlaying) {
      this.stopAutoPlay();
    } else {
      if (this.currentSlide === this.slides.length - 1) {
        this.currentSlide = 0;
      }
      this.startAutoPlay();
    }
  }

  // Hovering over the deck pauses it so it doesn't move under the pointer.
  pauseAutoPlay() {
    this.pointerPaused = true;
  }

  resumeAutoPlay() {
    this.pointerPaused = false;
  }

  /**
   * Keyboard focus inside the deck pauses it too. Only `:focus-visible`
   * counts, so a mouse click on a control doesn't leave it paused for good.
   */
  onDeckFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement | null;
    if (target?.matches?.(':focus-visible')) {
      this.focusPaused = true;
    }
  }

  onDeckFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (!next || !(event.currentTarget as HTMLElement).contains(next)) {
      this.focusPaused = false;
    }
  }
}
