import { A11yModule } from '@angular/cdk/a11y';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

/** "Delete <name>?" Cancel is the safe, default choice. */
@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [A11yModule],
  template: `
    <div class="backdrop" (click)="$event.target === $event.currentTarget && cancelled()">
      <div class="dialog" role="alertdialog" aria-modal="true"
        aria-labelledby="delete-title" aria-describedby="delete-text"
        cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
        <h2 id="delete-title" class="title">Delete “{{ name }}”?</h2>
        <p id="delete-text" class="text">This can't be undone. Days you already logged keep their numbers.</p>
        @if (error) {
          <p class="error" role="alert">We couldn't delete this recipe. Try again.</p>
        }
        <div class="actions">
          <button type="button" class="btn btn--danger" [disabled]="busy" (click)="confirm.emit()">
            {{ busy ? 'Deleting…' : 'Delete recipe' }}
          </button>
          <button type="button" class="btn btn--secondary" cdkFocusInitial [disabled]="busy" (click)="cancelled()">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 3000;
      display: grid;
      place-items: center;
      padding: 16px;
      background: rgba(0, 0, 0, 0.55);
    }
    .dialog {
      width: 100%;
      max-width: 440px;
      padding: 24px;
      border: 1px solid var(--color-line);
      border-radius: 22px;
      background: var(--color-surface);
      color: var(--color-ink);
      box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.35);
    }
    .title { margin: 0; font-family: var(--font-family-display); font-size: 1.375rem; font-weight: 700; overflow-wrap: anywhere; }
    .text { margin: 8px 0 20px; color: var(--color-muted); line-height: 1.5; }
    .error { margin: -8px 0 16px; color: var(--rd-danger, #b42318); font-size: 0.875rem; font-weight: 600; }
    .actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; }
    .btn {
      min-height: 48px;
      padding: 0 20px;
      border-radius: 12px;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }
    .btn:disabled { cursor: default; opacity: 0.7; }
    .btn--danger { border: 1px solid transparent; background: var(--rd-danger, #b42318); color: #fff; }
    .btn--secondary { border: 1px solid var(--color-line); background: transparent; color: var(--color-ink); }
    .btn--secondary:hover:not(:disabled) { border-color: var(--color-muted); }
    .btn:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
    /* Dark danger is a light red: dark text keeps the button readable. */
    :host-context(.dark-theme) .btn--danger { color: #1a0b0a; }
    @media (max-width: 480px) {
      .actions { flex-direction: column-reverse; }
      .btn { width: 100%; }
    }
  `,
})
export class DeleteDialogComponent {
  @Input({ required: true }) name = '';
  /** Deleting: both buttons wait. */
  @Input() busy = false;
  /** The last try failed. */
  @Input() error = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  cancelled(): void {
    if (!this.busy) this.cancel.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancelled();
  }
}
