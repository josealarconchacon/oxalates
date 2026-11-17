import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { BreakdownRowView } from './breakdown-view';

/** "What's driving this": each ingredient's mg and share of the whole recipe. */
@Component({
  selector: 'app-recipe-breakdown',
  standalone: true,
  imports: [IconComponent],
  template: `
    <section class="rd-breakdown" aria-labelledby="breakdown-title">
      <div class="head">
        <h2 class="h2" id="breakdown-title">What's driving this</h2>
        <button type="button" class="switch" role="switch" [attr.aria-checked]="showSources"
          (click)="showSourcesChange.emit(!showSources)">
          <span class="switch-label">Show sources</span>
          <span class="switch-track" aria-hidden="true"><span class="switch-knob"></span></span>
        </button>
      </div>
      <p class="sub">
        Whole recipe, highest first.
        @if (hasTotal) {
          Bars show each ingredient's share of {{ totalMg }} mg.
        }
      </p>

      <ul class="rows">
        @for (row of rows; track row.ingredientId) {
          <li class="row-item" [id]="'ing-' + row.ingredientId" tabindex="-1" [attr.aria-label]="labelFor(row)">
            <div aria-hidden="true">
              <div class="line1">
                <span class="name">{{ row.name }}</span>
                @if (row.known) {
                  <span class="mg">{{ row.mg }} mg</span>
                } @else {
                  <span class="mg mg--unknown"><app-icon name="alert-triangle" [size]="14" /> Unknown</span>
                }
                <span class="pct">{{ row.share }}</span>
              </div>
              @if (row.amount) {
                <p class="amount">{{ row.amount }}</p>
              }
              @if (sourceShown(row)) {
                <p class="source">{{ row.source }}</p>
              }
              @if (row.known) {
                <div class="track"><div class="fill" [style.width.%]="row.barWidth"></div></div>
              }
            </div>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .rd-breakdown {
      padding: 24px;
      border: 1px solid var(--color-line);
      border-radius: 22px;
      background: var(--color-surface);
    }
    .head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
    .h2 { margin: 0; font-family: var(--font-family-display); font-size: 1.375rem; font-weight: 700; }
    .sub { margin: 6px 0 0; color: var(--color-muted); font-size: 0.875rem; }
    .rows { display: grid; gap: 4px; margin: 16px 0 0; padding: 0; list-style: none; }
    .row-item { padding: 12px 8px; margin: 0 -8px; border-radius: 12px; }
    .row-item:not(:last-child) { border-bottom: 1px solid var(--color-line); border-radius: 0; }
    .row-item:focus-visible { outline: var(--focus-ring); outline-offset: 2px; border-radius: 12px; }
    .line1 { display: flex; align-items: baseline; gap: 12px; font-variant-numeric: tabular-nums; }
    .name { flex: 1; min-width: 0; font-size: 0.9375rem; font-weight: 700; overflow-wrap: anywhere; }
    .mg { flex: none; font-size: 0.9375rem; font-weight: 700; }
    .mg--unknown {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--rd-warning-text);
      --icon-stroke: 2.25;
    }
    .pct { flex: none; width: 44px; text-align: right; color: var(--color-muted); font-size: 0.875rem; }
    .amount { margin: 2px 0 0; color: var(--color-muted); font-size: 0.8125rem; }
    .source { margin: 2px 0 0; color: var(--color-muted); font-size: 0.75rem; overflow-wrap: anywhere; }
    .switch {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      margin-right: -8px;
      padding: 0 8px;
      border: 0;
      border-radius: 12px;
      background: transparent;
      color: var(--color-ink);
      font: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
    }
    .switch-track {
      position: relative;
      flex: none;
      width: 36px;
      height: 20px;
      border-radius: 999px;
      background: var(--color-line);
      transition: background-color 0.15s;
    }
    .switch-knob {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
      transition: transform 0.15s;
    }
    .switch[aria-checked='true'] .switch-track { background: var(--color-accent); }
    .switch[aria-checked='true'] .switch-knob { transform: translateX(16px); }
    .switch:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) {
      .switch-track, .switch-knob { transition: none; }
    }
    .track { height: 8px; margin-top: 10px; border-radius: 999px; background: var(--rd-surface-2); overflow: hidden; }
    .fill { height: 100%; border-radius: 999px; background: var(--rd-bar); }
    @media (max-width: 640px) {
      .rd-breakdown { padding: 18px; }
    }
  `,
})
export class BreakdownComponent {
  @Input({ required: true }) rows: BreakdownRowView[] = [];
  /** "20.0": the known whole-recipe total the shares are of. */
  @Input({ required: true }) totalMg = '';
  /** False when no ingredient has a value (no bars, so no bar sentence). */
  @Input() hasTotal = true;
  @Input() showSources = false;
  @Output() showSourcesChange = new EventEmitter<boolean>();

  sourceShown(row: BreakdownRowView): boolean {
    return !!row.source && (this.showSources || row.missingFood);
  }

  /** The row's visible text is hidden from screen readers, so the label carries the source too. */
  labelFor(row: BreakdownRowView): string {
    return this.sourceShown(row) ? `${row.ariaLabel}, ${row.source}` : row.ariaLabel;
  }
}
