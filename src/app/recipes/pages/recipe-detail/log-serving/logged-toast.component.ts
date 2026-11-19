import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface LoggedToastData {
  message: string;
  viewDay: () => void;
  /** Resolves when the entry is gone; rejects if it couldn't be removed. */
  undo: () => Promise<void>;
}

/** How long the toast stays, not counting time hovered or focused. */
export const LOGGED_TOAST_MS = 8000;

/**
 * "Added to Dinner on Thu, Nov 19." + View day + Undo. It stays ~8 s and
 * pauses while the pointer is over it or focus is inside it.
 */
@Component({
  selector: 'app-logged-toast',
  standalone: true,
  template: `
    <div class="toast">
      <span class="message">{{ data.message }}</span>
      <span class="actions">
        <button type="button" class="action" [disabled]="busy" (click)="view()">View day</button>
        <button type="button" class="action" [disabled]="busy" (click)="undo()">
          {{ busy ? 'Undoing…' : 'Undo' }}
        </button>
      </span>
    </div>
  `,
  styles: `
    .toast { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; }
    .message { flex: 1 1 auto; min-width: 0; }
    .actions { display: flex; gap: 4px; margin-left: auto; }
    .action {
      min-height: 36px;
      padding: 0 10px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: inherit;
      font: inherit;
      font-weight: 700;
      text-decoration: underline;
      text-underline-offset: 3px;
      cursor: pointer;
    }
    .action:hover:not(:disabled) { background: rgba(255, 255, 255, 0.14); }
    .action:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
    .action:disabled { cursor: default; opacity: 0.7; }
  `,
})
export class LoggedToastComponent implements OnInit, OnDestroy {
  readonly data = inject<LoggedToastData>(MAT_SNACK_BAR_DATA);
  private ref = inject(MatSnackBarRef<LoggedToastComponent>);

  busy = false;
  private remaining = LOGGED_TOAST_MS;
  private startedAt = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private hovered = false;
  private focused = false;

  ngOnInit(): void {
    this.resume();
  }

  ngOnDestroy(): void {
    this.pause();
  }

  view(): void {
    this.ref.dismiss();
    this.data.viewDay();
  }

  async undo(): Promise<void> {
    this.busy = true;
    this.pause();
    try {
      await this.data.undo();
    } finally {
      this.ref.dismiss();
    }
  }

  @HostListener('mouseenter') onEnter(): void {
    this.hovered = true;
    this.pause();
  }

  @HostListener('mouseleave') onLeave(): void {
    this.hovered = false;
    this.resume();
  }

  @HostListener('focusin') onFocusIn(): void {
    this.focused = true;
    this.pause();
  }

  @HostListener('focusout') onFocusOut(): void {
    this.focused = false;
    this.resume();
  }

  private pause(): void {
    if (!this.timer) return;
    clearTimeout(this.timer);
    this.timer = null;
    this.remaining -= Date.now() - this.startedAt;
  }

  private resume(): void {
    if (this.timer || this.busy || this.hovered || this.focused) return;
    this.startedAt = Date.now();
    this.timer = setTimeout(() => this.ref.dismiss(), Math.max(this.remaining, 1000));
  }
}
