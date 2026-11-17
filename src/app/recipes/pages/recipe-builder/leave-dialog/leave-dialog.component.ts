import { A11yModule } from '@angular/cdk/a11y';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';

/** "Leave without saving?" Keep editing is the safe, default choice. */
@Component({
  selector: 'app-leave-dialog',
  standalone: true,
  imports: [A11yModule],
  template: `
    <div class="backdrop" (click)="$event.target === $event.currentTarget && choose.emit(false)">
      <div class="dialog" role="alertdialog" aria-modal="true"
        aria-labelledby="leave-title" aria-describedby="leave-text"
        cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
        <h2 id="leave-title" class="title">Leave without saving?</h2>
        <p id="leave-text" class="text">Your changes to this recipe will be lost.</p>
        <div class="actions">
          <button type="button" class="btn btn--primary" cdkFocusInitial (click)="choose.emit(false)">Keep editing</button>
          <button type="button" class="btn btn--secondary" (click)="choose.emit(true)">Leave</button>
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
      max-width: 420px;
      padding: 24px;
      border: 1px solid var(--color-line);
      border-radius: 22px;
      background: var(--color-surface);
      color: var(--color-ink);
      box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.35);
    }
    .title { margin: 0; font-family: var(--font-family-display); font-size: 1.375rem; font-weight: 700; }
    .text { margin: 8px 0 20px; color: var(--color-muted); line-height: 1.5; }
    .actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; }
    .btn {
      min-height: 48px;
      padding: 0 20px;
      border-radius: 12px;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }
    .btn--primary { border: 1px solid transparent; background: var(--color-accent); color: #fff; }
    .btn--secondary { border: 1px solid var(--color-line); background: transparent; color: var(--color-ink); }
    .btn--secondary:hover { border-color: var(--color-muted); }
    .btn:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
    @media (max-width: 480px) {
      .actions { flex-direction: column; }
      .btn { width: 100%; }
    }
  `,
})
export class LeaveDialogComponent {
  /** true = leave (drop the changes), false = keep editing. */
  @Output() choose = new EventEmitter<boolean>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.choose.emit(false);
  }
}
