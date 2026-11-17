import { Component, LOCALE_ID, OnInit, inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { RecipeFoodsService } from '../../data/recipe-foods.service';
import { RecipeService } from '../../data/recipe.service';
import { formatMg } from '../../engine/format';
import { calculateRecipe } from '../../engine/recipe-calculator';
import { levelForMgPerServing } from '../../engine/recipe-level';
import { Recipe, RecipeResult } from '../../model/recipe';
import { LevelPillComponent } from '../../shared/level-pill/level-pill.component';
import { BreakdownComponent } from './breakdown/breakdown.component';
import { BreakdownRowView, breakdownRows } from './breakdown/breakdown-view';
import { IncompleteBadgeComponent } from './incomplete-badge/incomplete-badge.component';

/** Levels that get the calm "higher side" note. */
const HIGHER_LEVELS = new Set(['high', 'very high', 'extremely high']);

/** /recipes/:id — one recipe, its numbers and what drives them. */
@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [RouterLink, IconComponent, LevelPillComponent, IncompleteBadgeComponent, BreakdownComponent],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.css',
})
export class RecipeDetailComponent implements OnInit {
  private recipes = inject(RecipeService);
  private foods = inject(RecipeFoodsService);
  private route = inject(ActivatedRoute);
  private locale = inject(LOCALE_ID);

  state: 'loading' | 'not-found' | 'error' | 'ready' = 'loading';
  recipe: Recipe | null = null;
  result: RecipeResult | null = null;
  rows: BreakdownRowView[] = [];
  private id = '';

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    void this.load();
  }

  async load(): Promise<void> {
    this.state = 'loading';
    try {
      const [recipe, getFood] = await Promise.all([
        this.recipes.get(this.id),
        firstValueFrom(this.foods.lookup$),
      ]);
      this.recipe = recipe;
      this.result = recipe ? calculateRecipe(recipe, getFood, levelForMgPerServing) : null;
      this.rows = recipe && this.result ? breakdownRows(recipe, this.result) : [];
      this.state = recipe ? 'ready' : 'not-found';
    } catch {
      this.state = 'error';
    }
  }

  /** "Serves 4 · Edited Nov 17" (the year only when it isn't this year). */
  get metaLine(): string {
    const r = this.recipe;
    if (!r) return '';
    const serves = `Serves ${r.serves}`;
    const edited = this.editedDate(r.updatedAt || r.createdAt);
    return edited ? `${serves} · Edited ${edited}` : serves;
  }

  /** Text for the numbers; "at least" is a separate flag so it can be styled. */
  get numbers() {
    const res = this.result!;
    return {
      perServing: formatMg(res.perServingMg),
      whole: formatMg(res.totalMg),
      solublePerServing: formatMg(res.perServingSolubleMg),
      solubleWhole: formatMg(res.totalSolubleMg),
      atLeast: res.incomplete,
      solubleAtLeast: res.solubleIncomplete,
      /** No ingredient has a soluble value, so there is nothing to show. */
      solubleUnknown: !res.breakdown.some((b) => b.solubleMg !== null),
    };
  }

  get isHigher(): boolean {
    const level = this.result?.level;
    return !!level && !this.result!.allUnknown && HIGHER_LEVELS.has(level.trim().toLowerCase());
  }

  /** From the Incomplete popover: bring an ingredient's breakdown row into view. */
  goToRow(ingredientId: string): void {
    const row = document.getElementById('ing-' + ingredientId);
    if (!row) return;
    row.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    row.focus({ preventScroll: true });
  }

  private editedDate(iso: string): string {
    const date = new Date(iso);
    if (!iso || isNaN(date.getTime())) return '';
    const thisYear = date.getFullYear() === new Date().getFullYear();
    return formatDate(date, thisYear ? 'MMM d' : 'MMM d, y', this.locale);
  }
}
