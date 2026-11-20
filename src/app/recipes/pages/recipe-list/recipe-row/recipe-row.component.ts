import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { LevelPillComponent } from '../../../shared/level-pill/level-pill.component';
import { ListItem, visibleTags } from '../list-query';

/** A recipe on the list on phones (640px and below): one link, like the card. */
@Component({
  selector: 'app-recipe-row',
  standalone: true,
  imports: [RouterLink, IconComponent, LevelPillComponent],
  template: `
    <a class="row-link" [routerLink]="['/recipes', item.recipe.id]" [attr.aria-label]="item.label">
      <span class="thumb" aria-hidden="true"><app-icon name="utensils" [size]="24" /></span>
      <span class="body" aria-hidden="true">
        <span class="name">{{ item.recipe.name }}</span>
        <span class="value">
          @if (item.allUnknown) {
            <span class="mg">Unknown</span>
          } @else {
            @if (item.incomplete) {<span class="at-least">at least </span>}
            <span class="mg">{{ item.perServing }} mg</span>
          }
          <span class="meta">per serving · Serves {{ item.recipe.serves }}</span>
        </span>
        <span class="badges">
          @if (item.level) {
            <app-level-pill [level]="item.level" [prefix]="item.incomplete ? 'At least ' : ''" />
          }
          @if (item.incomplete) {
            <span class="incomplete"><app-icon name="alert-triangle" [size]="12" /> Incomplete</span>
          }
          @for (t of tags.shown; track t) {<span class="tag">{{ t }}</span>}
          @if (tags.more) {<span class="tag tag--more">+{{ tags.more }}</span>}
        </span>
      </span>
    </a>
  `,
  styles: `
    :host {
      display: block;
      --rr-photo-bg: #f3e7da;
      --rr-photo-icon: #8a5a2b;
      --rr-warn-bg: #fff4db;
      --rr-warn-text: #6b4e00;
    }
    :host-context(.dark-theme) {
      --rr-photo-bg: #2b231b;
      --rr-photo-icon: #d8b28a;
      --rr-warn-bg: #33290e;
      --rr-warn-text: #f2c94c;
    }
    .row-link {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 12px;
      border: 1px solid var(--color-line);
      border-radius: 18px;
      background: var(--color-surface);
      color: var(--color-ink);
      text-decoration: none;
    }
    .row-link:focus-visible { outline: 2px solid var(--color-accent-fg); outline-offset: 2px; }
    .thumb {
      display: grid;
      place-items: center;
      flex: none;
      width: 72px;
      height: 72px;
      border-radius: 14px;
      background: var(--rr-photo-bg);
      color: var(--rr-photo-icon);
      --icon-stroke: 1.5;
    }
    .body { display: grid; gap: 4px; min-width: 0; }
    .name { font-size: 1rem; font-weight: 700; line-height: 1.3; overflow-wrap: anywhere; }
    .value { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 6px; font-variant-numeric: tabular-nums; }
    .mg { font-weight: 700; }
    .at-least, .meta { color: var(--color-muted); font-size: 0.8125rem; }
    .at-least { font-weight: 600; }
    .badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
    .incomplete {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--rr-warn-bg);
      color: var(--rr-warn-text);
      font-size: 0.75rem;
      font-weight: 700;
      --icon-stroke: 2.25;
    }
    .tag {
      padding: 2px 10px;
      border: 1px solid var(--color-line);
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1.5;
    }
    .tag--more { color: var(--color-muted); }
  `,
})
export class RecipeRowComponent {
  @Input({ required: true }) item!: ListItem;

  get tags() {
    return visibleTags(this.item.recipe.tags, 2);
  }
}
