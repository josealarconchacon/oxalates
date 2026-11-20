import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { LevelPillComponent } from '../../../shared/level-pill/level-pill.component';
import { ListItem, visibleTags } from '../list-query';

/**
 * A recipe on the list (641px and up). The whole card is one link; its name
 * says the recipe, the per-serving value and the level.
 */
@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [RouterLink, IconComponent, LevelPillComponent],
  template: `
    <a class="card" [routerLink]="['/recipes', item.recipe.id]" [attr.aria-label]="item.label">
      <span class="photo" role="img" aria-label="Recipe photo">
        <app-icon name="utensils" [size]="32" />
      </span>
      <span class="body" aria-hidden="true">
        <span class="name">{{ item.recipe.name }}</span>
        <span class="serves">Serves {{ item.recipe.serves }}</span>
        <span class="value">
          @if (item.allUnknown) {
            <span class="big big--unknown">Unknown</span>
          } @else {
            @if (item.incomplete) {<span class="at-least">at least </span>}
            <span class="big">{{ item.perServing }}</span>
          }
          <span class="unit">{{ item.allUnknown ? 'per serving' : 'mg per serving' }}</span>
        </span>
        <span class="badges">
          @if (item.level) {
            <app-level-pill [level]="item.level" [prefix]="item.incomplete ? 'At least ' : ''" />
          }
          @if (item.incomplete) {
            <span class="incomplete"><app-icon name="alert-triangle" [size]="12" /> Incomplete</span>
          }
        </span>
        @if (tags.shown.length) {
          <span class="tags">
            @for (t of tags.shown; track t) {<span class="tag">{{ t }}</span>}
            @if (tags.more) {<span class="tag tag--more">+{{ tags.more }}</span>}
          </span>
        }
      </span>
    </a>
  `,
  styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent {
  @Input({ required: true }) item!: ListItem;

  get tags() {
    return visibleTags(this.item.recipe.tags, 3);
  }
}
