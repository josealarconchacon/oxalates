import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
} from '@angular/core';

/**
 * Makes a non-interactive element (div, span, <a> without href) that already has
 * a (click) handler reachable and operable from the keyboard, by giving it button
 * semantics and firing the existing click handler on Enter/Space.
 */
@Directive({
  selector: '[appClickable]',
  standalone: true,
})
export class ClickableDirective {
  @HostBinding('attr.role') role = 'button';
  @HostBinding('attr.tabindex') tabindex = '0';

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onKeydown(event: Event): void {
    event.preventDefault();
    this.elementRef.nativeElement.click();
  }
}
