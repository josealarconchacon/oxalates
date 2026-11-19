import { Component, EventEmitter, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RecipeFoodsService } from 'src/app/recipes/data/recipe-foods.service';
import { RecipeService } from 'src/app/recipes/data/recipe.service';
import { formatMg } from 'src/app/recipes/engine/format';
import { calculateRecipe } from 'src/app/recipes/engine/recipe-calculator';
import { levelForMgPerServing } from 'src/app/recipes/engine/recipe-level';
import { Recipe, RecipeResult } from 'src/app/recipes/model/recipe';
import { LevelPillComponent } from 'src/app/recipes/shared/level-pill/level-pill.component';
import { DayState, LogPreviewComponent } from 'src/app/recipes/shared/log/log-preview.component';
import { ServingsFieldComponent } from 'src/app/recipes/shared/log/servings-field.component';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { Totals } from '../model/day-totals';
import { MealKey } from '../service/food-entry.service';

const MEAL_LABELS: Record<MealKey, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };

interface RecipeOption {
  recipe: Recipe;
  result: RecipeResult;
  /** "5.7" mg per serving. */
  perServing: string;
}

export interface RecipePick {
  recipe: Recipe;
  result: RecipeResult;
  multiplier: number;
}

/**
 * Add Food → Recipes: search your recipes, pick one, choose servings, see
 * what it adds, then Log Food. Day and meal come from where Add Food opened.
 */
@Component({
  selector: 'app-recipe-picker',
  standalone: true,
  imports: [RouterLink, IconComponent, LevelPillComponent, ServingsFieldComponent, LogPreviewComponent],
  templateUrl: './recipe-picker.component.html',
  styleUrl: './recipe-picker.component.css',
})
export class RecipePickerComponent implements OnInit {
  private recipes = inject(RecipeService);
  private foods = inject(RecipeFoodsService);

  @Input({ required: true }) mealType!: MealKey;
  /** The open day's totals right now (the page already has them). */
  @Input({ required: true }) dayTotals!: Totals;
  /** Set when the open day is after today. */
  @Input() plannedFor: Date | null = null;
  @Input() saving = false;
  @Input() error = false;
  @Output() pick = new EventEmitter<RecipePick>();

  @ViewChild(ServingsFieldComponent) private servings?: ServingsFieldComponent;

  state: 'loading' | 'error' | 'ready' = 'loading';
  options: RecipeOption[] = [];
  query = '';
  /** Highlighted row in the list (keyboard), -1 for none. */
  active = -1;
  selected: RecipeOption | null = null;

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.state = 'loading';
    try {
      const [list, getFood] = await Promise.all([this.recipes.list(), firstValueFrom(this.foods.lookup$)]);
      this.options = list.map((recipe) => {
        const result = calculateRecipe(recipe, getFood, levelForMgPerServing);
        return { recipe, result, perServing: formatMg(result.perServingMg) };
      });
      this.state = 'ready';
    } catch {
      this.state = 'error';
    }
  }

  get mealLabel(): string {
    return MEAL_LABELS[this.mealType];
  }

  get matches(): RecipeOption[] {
    const q = this.query.trim().toLowerCase();
    return q ? this.options.filter((o) => o.recipe.name.toLowerCase().includes(q)) : this.options;
  }

  get dayState(): DayState {
    return { status: 'ready', totals: this.dayTotals };
  }

  get multiplier(): number {
    return this.servings?.multiplier ?? 1;
  }

  optionId(i: number): string {
    return `recipe-option-${i}`;
  }

  onQuery(text: string): void {
    this.query = text;
    this.active = this.matches.length ? 0 : -1;
  }

  /** ↑/↓ move through the list; Enter picks the highlighted recipe. */
  onSearchKey(event: KeyboardEvent): void {
    const count = this.matches.length;
    if (!count) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.active = (this.active + 1) % count;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.active = (this.active - 1 + count) % count;
    } else if (event.key === 'Enter' && this.active >= 0) {
      event.preventDefault();
      this.choose(this.matches[this.active]);
    }
  }

  choose(option: RecipeOption): void {
    this.selected = option;
    // The search box goes away, so put focus on the next choice: the servings.
    setTimeout(() =>
      document.querySelector<HTMLElement>('[aria-labelledby="log-servings-label"] [aria-checked="true"]')?.focus()
    );
  }

  /** Back to the list, keeping what was typed. */
  change(): void {
    this.selected = null;
    setTimeout(() => document.getElementById('recipe-search')?.focus());
  }

  submit(): void {
    if (!this.selected || this.saving) return;
    if (this.servings?.invalid) {
      this.servings.focusCustom();
      return;
    }
    this.pick.emit({ recipe: this.selected.recipe, result: this.selected.result, multiplier: this.multiplier });
  }
}
