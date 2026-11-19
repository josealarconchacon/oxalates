import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { Totals, snapshotTotals, sumTotals } from 'src/app/user-auth/profile/food-entry/model/day-totals';
import { formatMg } from '../../engine/format';
import { createLogSnapshot } from '../../engine/recipe-snapshot';
import { Recipe, RecipeLogSnapshot, RecipeResult } from '../../model/recipe';
import { LevelPillComponent } from '../level-pill/level-pill.component';

/** The chosen day's total before logging, or why we don't have it. */
export type DayState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; totals: Totals };

/**
 * What logging would add: "Adds 5.6 mg to Dinner" + level, soluble, an
 * optional "Planned for …", and "Day total: A → B". Display only; the saved
 * snapshot comes from the same engine call.
 */
@Component({
  selector: 'app-log-preview',
  standalone: true,
  imports: [DatePipe, IconComponent, LevelPillComponent],
  template: `
    <div class="preview" aria-live="polite">
      <div class="preview-top">
        <p class="adds">{{ adds }}</p>
        @if (snapshot.level && !result.allUnknown) {
          <app-level-pill [level]="snapshot.level" [prefix]="snapshot.incomplete ? 'At least ' : ''" />
        }
      </div>
      <p class="soluble">{{ soluble }}</p>
      @if (plannedFor) {
        <p class="planned"><app-icon name="calendar" [size]="14" /> Planned for {{ plannedFor | date: 'EEE, MMM d' }}</p>
      }
      <p class="day-total">
        <span class="day-total-label">Day total:</span>
        @switch (day.status) {
          @case ('loading') {<span class="muted">Loading…</span>}
          @case ('error') {<span class="muted">We couldn't load this day.</span>}
          @default {
            <span class="before">{{ dayTotal?.before }}</span>
            <app-icon name="chevron-right" [size]="14" aria-hidden="true" />
            <span class="sr-only">to</span>
            <span class="after">{{ dayTotal?.after }}</span>
          }
        }
      </p>
    </div>
  `,
  styles: `
    :host { display: block; --lp-surface-2: #f1f4f0; }
    :host-context(.dark-theme) { --lp-surface-2: #1d2621; }
    .preview { display: grid; gap: 6px; padding: 16px 18px; border-radius: 16px; background: var(--lp-surface-2); }
    p { margin: 0; }
    .preview-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .adds { font-size: 1rem; font-weight: 700; }
    .soluble { color: var(--color-muted); font-size: 0.875rem; }
    .planned { display: flex; align-items: center; gap: 6px; color: var(--color-muted); font-size: 0.875rem; --icon-stroke: 2; }
    .day-total {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 10px;
      margin-top: 4px;
      font-variant-numeric: tabular-nums;
      --icon-stroke: 2;
    }
    .day-total-label, .muted { color: var(--color-muted); font-size: 0.875rem; }
    .before { font-size: 0.9375rem; font-weight: 700; }
    .after { font-family: var(--font-family-display); font-size: 1.375rem; font-weight: 700; }
    .day-total app-icon { color: var(--color-muted); }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  `,
})
export class LogPreviewComponent {
  @Input({ required: true }) recipe!: Pick<Recipe, 'id' | 'name' | 'serves'>;
  @Input({ required: true }) result!: RecipeResult;
  @Input({ required: true }) multiplier = 1;
  @Input({ required: true }) mealLabel = '';
  @Input({ required: true }) day: DayState = { status: 'loading' };
  /** Set for a day after today. */
  @Input() plannedFor: Date | null = null;

  get snapshot(): RecipeLogSnapshot {
    return createLogSnapshot(this.recipe, this.result, this.multiplier);
  }

  get adds(): string {
    if (this.result.allUnknown) return `Adds an unknown amount to ${this.mealLabel}`;
    const s = this.snapshot;
    return `Adds ${s.incomplete ? 'at least ' : ''}${formatMg(s.mg)} mg to ${this.mealLabel}`;
  }

  get soluble(): string {
    const s = this.snapshot;
    if (!this.result.breakdown.some((b) => b.solubleMg !== null)) return 'Soluble unknown';
    return `Soluble ${s.incomplete || s.solubleIncomplete ? 'at least ' : ''}${formatMg(s.solubleMg)} mg`;
  }

  /** "12.0 mg" → "17.6 mg", with "at least" where the day or the recipe is incomplete. */
  get dayTotal(): { before: string; after: string } | null {
    if (this.day.status !== 'ready') return null;
    const before = this.day.totals;
    const after = sumTotals([before, snapshotTotals(this.snapshot)]);
    const text = (t: Totals) => `${t.atLeast ? 'at least ' : ''}${formatMg(t.mg)} mg`;
    return { before: text(before), after: text(after) };
  }
}
