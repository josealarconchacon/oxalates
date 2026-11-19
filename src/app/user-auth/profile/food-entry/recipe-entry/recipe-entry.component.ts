import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatMg } from 'src/app/recipes/engine/format';
import { LevelPillComponent } from 'src/app/recipes/shared/level-pill/level-pill.component';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { RecipeEntry } from '../service/food-entry.service';

const FRACTIONS: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾' };

/** "½ serving", "1 serving", "1.5 servings", "2 servings". */
export function servingsLabel(multiplier: number): string {
  const n = Math.round(multiplier * 100) / 100;
  const text = FRACTIONS[String(n)] ?? String(n);
  return `${text} ${n > 1 ? 'servings' : 'serving'}`;
}

/**
 * A logged recipe in a Daily Intake meal. Everything shown comes from the
 * saved snapshot, so editing or deleting the recipe never changes it.
 */
@Component({
  selector: 'app-recipe-entry',
  standalone: true,
  imports: [RouterLink, IconComponent, LevelPillComponent],
  template: `
    <div class="entry">
      <span class="tile" aria-hidden="true"><app-icon name="book-open" [size]="20" /></span>
      <div class="text">
        @if (deleted) {
          <span class="name">{{ s.recipeName }}</span>
        } @else {
          <a class="name name--link" [routerLink]="['/recipes', s.recipeId]">{{ s.recipeName }}</a>
        }
        <span class="sub">
          Recipe · {{ servings }}
          @if (deleted) {<span class="deleted"> · Recipe deleted</span>}
        </span>
        @if ((s.level && !allUnknown) || s.incomplete) {
          <span class="badges">
            @if (s.level && !allUnknown) {
              <app-level-pill [level]="s.level" [prefix]="s.incomplete ? 'At least ' : ''" />
            }
            @if (s.incomplete) {
              <span class="incomplete"><app-icon name="alert-triangle" [size]="12" /> Incomplete</span>
            }
          </span>
        }
      </div>
      <span class="mg">
        @if (allUnknown) {
          Unknown
        } @else {
          @if (s.incomplete) {<span class="at-least">at least </span>}{{ mg }} mg
        }
      </span>
    </div>
  `,
  styles: `
    :host { display: block; --rd-tile-bg: #f3e7da; --rd-tile-icon: #8a5a2b; --rd-warn-bg: #fff4db; --rd-warn-text: #6b4e00; }
    :host-context(.dark-theme) { --rd-tile-bg: #2b231b; --rd-tile-icon: #d8b28a; --rd-warn-bg: #33290e; --rd-warn-text: #f2c94c; }
    .entry { display: flex; align-items: flex-start; gap: 12px; padding: 4px 0; }
    .tile {
      display: grid;
      place-items: center;
      flex: none;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--rd-tile-bg);
      color: var(--rd-tile-icon);
      --icon-stroke: 1.75;
    }
    .text { display: grid; gap: 2px; flex: 1; min-width: 0; }
    .name { font-size: 0.9375rem; font-weight: 700; color: var(--color-ink); overflow-wrap: break-word; }
    .name--link { text-decoration: none; }
    .name--link:hover { text-decoration: underline; }
    .name--link:focus-visible { outline: var(--focus-ring); outline-offset: 2px; border-radius: 4px; }
    .sub { font-size: 0.8125rem; color: var(--color-muted); }
    .mg { flex: none; text-align: right; font-size: 0.9375rem; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .at-least { font-size: 0.75rem; font-weight: 600; color: var(--color-muted); }
    .badges { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
    .incomplete {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 1px 8px;
      border-radius: 999px;
      background: var(--rd-warn-bg);
      color: var(--rd-warn-text);
      font-size: 0.75rem;
      font-weight: 700;
      line-height: 1.6;
      --icon-stroke: 2.25;
    }
  `,
})
export class RecipeEntryComponent {
  @Input({ required: true }) entry!: RecipeEntry;
  /** The recipe no longer exists: plain name + "Recipe deleted"; the numbers stay. */
  @Input() deleted = false;

  get s() {
    return this.entry.snapshot;
  }

  get servings(): string {
    return servingsLabel(this.s.multiplier);
  }

  get mg(): string {
    return formatMg(this.s.mg);
  }

  /** No ingredient had a value: show "Unknown", never 0. */
  get allUnknown(): boolean {
    return this.s.incomplete && this.s.ingredients.length > 0 && this.s.ingredients.every((i) => i.mg === null);
  }
}
