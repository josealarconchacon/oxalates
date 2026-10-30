import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  OnDestroy,
  Output,
} from '@angular/core';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Turns an element into a modal dialog for keyboard and screen-reader users:
 * adds the dialog role, moves focus inside when it opens, keeps Tab/Shift+Tab
 * within it, closes on Escape, and returns focus to whatever opened it.
 *
 * Put it on the dialog box itself (not the dimmed overlay) and give that
 * element an aria-label or aria-labelledby. Mouse behaviour (backdrop click,
 * close buttons) stays with the host component; bind (dialogClose) to the same
 * close method so Escape does the same thing.
 *
 * Add `data-autofocus` to an element inside to choose where focus lands first.
 */
@Directive({
  selector: '[appDialog]',
  standalone: true,
})
export class DialogDirective implements AfterViewInit, OnDestroy {
  // Only the top-most dialog should react to Escape or pull focus back.
  private static openDialogs: DialogDirective[] = [];

  @Output() dialogClose = new EventEmitter<void>();

  @HostBinding('attr.role') readonly role = 'dialog';
  @HostBinding('attr.aria-modal') readonly ariaModal = 'true';
  @HostBinding('attr.tabindex') readonly tabindex = '-1';

  // Captured at creation, while focus is still on the control that opened us.
  private readonly opener: HTMLElement | null =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  constructor(private host: ElementRef<HTMLElement>) {
    DialogDirective.openDialogs.push(this);
  }

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;
    const target =
      el.querySelector<HTMLElement>('[data-autofocus]') ??
      this.focusableChildren()[0] ??
      el;
    target.focus({ preventScroll: true });
  }

  ngOnDestroy(): void {
    DialogDirective.openDialogs = DialogDirective.openDialogs.filter(
      (d) => d !== this
    );

    // Hand focus back, unless the user has already moved on to something else.
    const active = document.activeElement;
    const focusWasOurs =
      !active ||
      active === document.body ||
      this.host.nativeElement.contains(active);
    if (focusWasOurs && this.opener && document.contains(this.opener)) {
      this.opener.focus({ preventScroll: true });
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    const el = this.host.nativeElement;
    const items = this.focusableChildren();
    if (items.length === 0) {
      event.preventDefault();
      el.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === el)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (!this.isTop()) {
      return;
    }
    event.stopPropagation();
    this.dialogClose.emit();
  }

  // If focus lands outside (e.g. Tab from the browser chrome), pull it back in.
  @HostListener('document:focusin', ['$event'])
  onFocusIn(event: FocusEvent): void {
    const el = this.host.nativeElement;
    if (!this.isTop() || el.contains(event.target as Node)) {
      return;
    }
    (this.focusableChildren()[0] ?? el).focus({ preventScroll: true });
  }

  private isTop(): boolean {
    const stack = DialogDirective.openDialogs;
    return stack[stack.length - 1] === this;
  }

  private focusableChildren(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((el) => el.getClientRects().length > 0);
  }
}
