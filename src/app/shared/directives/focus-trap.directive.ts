import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  HostListener,
  AfterViewInit,
} from '@angular/core';

@Directive({
  selector: '[appFocusTrap]',
  standalone: true,
})
export class FocusTrapDirective implements OnInit, OnDestroy, AfterViewInit {
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  private previouslyFocusedElement: HTMLElement | null = null;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Store the currently focused element
    this.previouslyFocusedElement = document.activeElement as HTMLElement;
  }

  ngAfterViewInit(): void {
    // Get all focusable elements
    this.updateFocusableElements();

    // Focus the first element
    if (this.firstFocusableElement) {
      setTimeout(() => {
        this.firstFocusableElement?.focus();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    // Restore focus to the previously focused element
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }

    this.updateFocusableElements();

    if (!this.firstFocusableElement || !this.lastFocusableElement) {
      return;
    }

    // Shift + Tab
    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusableElement) {
        this.lastFocusableElement.focus();
        event.preventDefault();
      }
    }
    // Tab
    else {
      if (document.activeElement === this.lastFocusableElement) {
        this.firstFocusableElement.focus();
        event.preventDefault();
      }
    }
  }

  @HostListener('keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent): void {
    // Allow parent component to handle escape
    // This can be customized per implementation
  }

  private updateFocusableElements(): void {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusableElements =
      this.elementRef.nativeElement.querySelectorAll(focusableSelectors);

    if (focusableElements.length > 0) {
      this.firstFocusableElement = focusableElements[0] as HTMLElement;
      this.lastFocusableElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;
    }
  }
}
