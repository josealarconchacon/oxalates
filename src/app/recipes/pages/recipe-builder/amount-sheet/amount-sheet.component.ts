import { A11yModule } from '@angular/cdk/a11y';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { IngredientBreakdown, RecipeIngredient } from '../../../model/recipe';
import { formatMg } from '../../../engine/format';
import { UnitOption } from '../../../engine/units';
import { AmountEditorComponent } from '../amount-editor/amount-editor.component';

let nextId = 0;

/** Phones: a bottom sheet to change one ingredient's amount. Changes apply live. */
@Component({
  selector: 'app-amount-sheet',
  standalone: true,
  imports: [A11yModule, AmountEditorComponent],
  template: `
    <div class="backdrop" (click)="onBackdrop($event)">
      <div class="sheet" role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId"
        cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
        <span class="handle" aria-hidden="true"></span>
        <h2 class="title" [id]="titleId">{{ ingredient.name }}</h2>
        @if (source) {<p class="source">{{ source }}</p>}
        <app-amount-editor [ingredient]="ingredient" [options]="options" (changed)="changed.emit($event)" />
        <p class="mg">{{ mgText }}</p>
        <button type="button" class="done" (click)="closed.emit()">Done</button>
      </div>
    </div>
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 2000;
      display: flex;
      align-items: flex-end;
      background: rgba(0, 0, 0, 0.5);
    }
    .sheet {
      display: grid;
      gap: 12px;
      width: 100%;
      padding: 10px 20px calc(16px + env(safe-area-inset-bottom));
      border-radius: 24px 24px 0 0;
      background: var(--color-surface);
      color: var(--color-ink);
      animation: up 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .handle { justify-self: center; width: 40px; height: 4px; border-radius: 999px; background: var(--color-line); }
    .title { margin: 6px 0 0; font-family: var(--font-family-display); font-size: 1.25rem; font-weight: 700; }
    .source { margin: -8px 0 0; font-size: 0.8125rem; color: var(--color-muted); }
    .mg { margin: 0; font-weight: 700; font-variant-numeric: tabular-nums; }
    .done {
      min-height: 48px;
      border: 0;
      border-radius: 12px;
      background: var(--color-accent);
      color: #fff;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }
    .done:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
    @keyframes up { from { transform: translateY(100%); } }
    @media (prefers-reduced-motion: reduce) { .sheet { animation: none; } }
  `,
})
export class AmountSheetComponent {
  @Input({ required: true }) ingredient!: RecipeIngredient;
  @Input() row: IngredientBreakdown | undefined;
  @Input() options: UnitOption[] = [];
  @Input() source = '';
  @Output() changed = new EventEmitter<RecipeIngredient>();
  @Output() closed = new EventEmitter<void>();

  readonly titleId = `amount-sheet-title-${nextId++}`;

  get mgText(): string {
    if (!(this.ingredient.inputAmount > 0)) return 'Enter an amount';
    return this.row?.mg != null ? `${formatMg(this.row.mg)} mg` : 'Oxalate unknown';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closed.emit();
  }
}
