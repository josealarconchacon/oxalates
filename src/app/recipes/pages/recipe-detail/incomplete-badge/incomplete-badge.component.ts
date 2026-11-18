import { A11yModule } from '@angular/cdk/a11y';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';

/**
 * "Incomplete" badge: a button that opens a small popover naming the
 * ingredients with no oxalate value. Each name jumps to its breakdown row.
 */
@Component({
  selector: 'app-incomplete-badge',
  standalone: true,
  imports: [A11yModule, IconComponent],
  template: `
    <button #badge type="button" class="badge"
      aria-haspopup="dialog" [attr.aria-expanded]="open" aria-controls="incomplete-popover"
      (click)="toggle()">
      <app-icon name="alert-triangle" [size]="14" /> Incomplete
    </button>

    @if (open) {
      <div id="incomplete-popover" class="popover" role="dialog" aria-label="Incomplete"
        cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
        <p class="text">
          Incomplete: no oxalate value for
          @for (u of unknown; track u.id; let first = $first) {
            @if (!first) {, }<a class="name" [href]="'#ing-' + u.id" (click)="pick($event, u.id)">{{ u.name }}</a>
          }. The real total is higher.
        </p>
        <button type="button" class="close" aria-label="Close" (click)="close()">
          <app-icon name="x" [size]="16" />
        </button>
      </div>
    }
  `,
  styles: `
    :host { position: relative; display: inline-block; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 32px;
      padding: 0 10px;
      border: 0;
      border-radius: 999px;
      background: var(--rd-warning-bg);
      color: var(--rd-warning-text);
      font: inherit;
      font-size: 0.8125rem;
      font-weight: 700;
      cursor: pointer;
      --icon-stroke: 2.25;
    }
    /* 44px tap area without a bigger pill. */
    .badge::after { content: ''; position: absolute; inset: -6px 0; }
    .popover {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      z-index: 20;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      width: min(320px, calc(100vw - 32px));
      padding: 14px 10px 14px 16px;
      border: 1px solid var(--color-line);
      border-radius: 16px;
      background: var(--color-surface);
      color: var(--color-ink);
      box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.3);
    }
    .text { margin: 0; font-size: 0.875rem; line-height: 1.5; }
    .name { color: var(--color-accent-fg); font-weight: 700; }
    .close {
      display: grid;
      place-items: center;
      flex: none;
      width: 32px;
      height: 32px;
      margin: -6px 0 0;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: var(--color-muted);
      cursor: pointer;
      --icon-stroke: 2;
    }
    .badge:focus-visible, .name:focus-visible, .close:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
  `,
})
export class IncompleteBadgeComponent {
  private host = inject(ElementRef<HTMLElement>);

  /** Ingredients with no oxalate value, in breakdown order. */
  @Input({ required: true }) unknown: { id: string; name: string }[] = [];
  /** The user picked a name: show that ingredient's breakdown row. */
  @Output() goTo = new EventEmitter<string>();

  @ViewChild('badge') private badge!: ElementRef<HTMLButtonElement>;
  open = false;

  toggle(): void {
    this.open ? this.close() : (this.open = true);
  }

  close(returnFocus = true): void {
    if (!this.open) return;
    this.open = false;
    if (returnFocus) this.badge.nativeElement.focus();
  }

  pick(event: Event, id: string): void {
    event.preventDefault();
    this.close(false);
    this.goTo.emit(id);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open && !this.host.nativeElement.contains(event.target as Node)) this.close(false);
  }
}
