import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthMessageService } from '../../services/auth-message.service';
import {
  fadeInOut,
  slideAnimation,
  contentAnimation,
  indicatorPulse,
} from '../../animations/auth-message.animations';

@Component({
  selector: 'app-auth-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-message.component.html',
  animations: [fadeInOut, slideAnimation, contentAnimation, indicatorPulse],
  styleUrls: ['./auth-message.component.css'],
})
export class AuthMessageComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  slides = ['Welcome', 'Features'];
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly SWIPE_THRESHOLD = 50;
  private keyboardListener: any;
  private autoPlayInterval: any;
  private readonly SLIDE_INTERVAL = 5000; // 5 seconds between slides
  private isPaused = false;

  constructor(
    public authMessageService: AuthMessageService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.setupKeyboardNavigation();
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.removeKeyboardNavigation();
    this.stopAutoPlay();
  }

  private setupKeyboardNavigation() {
    this.keyboardListener = this.elementRef.nativeElement.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
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
          case 'Escape':
            event.preventDefault();
            this.onContinue();
            break;
        }
      }
    );
  }

  private removeKeyboardNavigation() {
    if (this.keyboardListener) {
      this.elementRef.nativeElement.removeEventListener(
        'keydown',
        this.keyboardListener
      );
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
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
    // Create and trigger an announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = `Showing slide ${this.currentSlide + 1} of ${
      this.slides.length
    }: ${this.slides[this.currentSlide]}`;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }

  onContinue() {
    this.authMessageService.continueToAuth();
  }

  private startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      if (!this.isPaused) {
        if (this.currentSlide < this.slides.length - 1) {
          this.nextSlide();
        } else {
          this.goToSlide(0); // Loop back to first slide
        }
      }
    }, this.SLIDE_INTERVAL);
  }

  private stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  // Add pause/resume methods
  pauseAutoPlay() {
    this.isPaused = true;
  }

  resumeAutoPlay() {
    this.isPaused = false;
  }
}
