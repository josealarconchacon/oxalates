import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from 'src/app/landing-page/dialog-service/oxalate/service/notification.service';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { RecipeFoodsService } from '../../data/recipe-foods.service';
import { RecipeDraft, RecipeService } from '../../data/recipe.service';
import { formatMg } from '../../engine/format';
import { FoodLookup, calculateRecipe } from '../../engine/recipe-calculator';
import { levelForMgPerServing } from '../../engine/recipe-level';
import { UnitOption, unitOptions } from '../../engine/units';
import { IngredientBreakdown, Recipe, RecipeIngredient, RecipeResult } from '../../model/recipe';
import { LevelPillComponent } from '../../shared/level-pill/level-pill.component';
import { AmountSheetComponent } from './amount-sheet/amount-sheet.component';
import { IngredientRowComponent } from './ingredient-row/ingredient-row.component';
import { LiveSummaryComponent } from './live-summary/live-summary.component';
import { SummaryView, summaryView } from './live-summary/summary-view';
import { ServesStepperComponent } from './serves-stepper/serves-stepper.component';

/** Create (/recipes/new) or edit (/recipes/:id/edit) a recipe. */
@Component({
  selector: 'app-recipe-builder',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IconComponent,
    ServesStepperComponent,
    IngredientRowComponent,
    AmountSheetComponent,
    LiveSummaryComponent,
    LevelPillComponent,
  ],
  templateUrl: './recipe-builder.component.html',
  styleUrl: './recipe-builder.component.css',
})
export class RecipeBuilderComponent implements OnInit {
  private recipes = inject(RecipeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notifications = inject(NotificationService);
  private foods = inject(RecipeFoodsService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('nameInput') private nameInput?: ElementRef<HTMLInputElement>;

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    serves: new FormControl<number | null>(4),
    notes: new FormControl('', { nonNullable: true }),
  });
  ingredients: RecipeIngredient[] = [];
  // Edited by a later step; kept as-is on save.
  tags: string[] = [];

  /** Recomputed by the engine on every change. */
  result!: RecipeResult;
  view!: SummaryView;
  private rowsById = new Map<string, IngredientBreakdown>();
  private getFood: FoodLookup = () => undefined;
  foodsReady = false;
  /** Phones: the ingredient whose amount sheet is open. */
  sheetId: string | null = null;
  @ViewChild('ingredientsTitle') private ingredientsTitle?: ElementRef<HTMLElement>;

  mode: 'create' | 'edit' = 'create';
  state: 'loading' | 'not-found' | 'ready' = 'ready';
  saving = false;
  saveFailed = false;
  nameError: string | null = null;
  private recipe: Recipe | null = null;

  ngOnInit(): void {
    this.recalc();
    this.foods.lookup$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((getFood) => {
      this.getFood = getFood;
      this.foodsReady = true;
      this.recalc();
    });
    this.form.controls.serves.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalc());

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode = 'edit';
      void this.load(id);
    }
  }

  async load(id: string): Promise<void> {
    this.state = 'loading';
    try {
      const recipe = await this.recipes.get(id);
      if (!recipe) {
        this.state = 'not-found';
        return;
      }
      this.recipe = recipe;
      this.form.setValue({ name: recipe.name, serves: recipe.serves, notes: recipe.notes ?? '' });
      this.ingredients = recipe.ingredients ?? [];
      this.tags = recipe.tags ?? [];
      this.recalc();
      this.state = 'ready';
    } catch {
      this.state = 'not-found';
    }
  }

  async save(): Promise<void> {
    if (this.saving) return;
    const { name, serves, notes } = this.form.getRawValue();
    this.nameError = name.trim() ? null : 'Give your recipe a name.';
    if (this.nameError) {
      this.nameInput?.nativeElement.focus();
      return;
    }
    const draft: RecipeDraft = {
      name: name.trim(),
      serves: serves ?? 1,
      notes,
      tags: this.tags,
      ingredients: this.ingredients,
    };

    this.saving = true;
    this.saveFailed = false;
    try {
      if (this.recipe) {
        await this.recipes.update({ ...this.recipe, ...draft });
      } else {
        await this.recipes.create(draft);
      }
      this.notifications.show('Recipe saved.', 'Close', ['success-snackbar']);
      // TODO(PR 3): open the recipe's detail page instead of the list.
      void this.router.navigate(['/recipes']);
    } catch {
      this.saveFailed = true;
    } finally {
      this.saving = false;
    }
  }

  clearNameError(): void {
    this.nameError = null;
  }

  // ---- Ingredients and the live total ----

  get serves(): number {
    const s = this.form.controls.serves.value;
    return s && s >= 1 ? s : 1;
  }

  /** "8 · 22.4 mg" next to the Ingredients heading. */
  get ingredientsTotal(): string {
    const prefix = this.result.incomplete ? 'at least ' : '';
    return `${this.ingredients.length} · ${prefix}${formatMg(this.result.totalMg)} mg`;
  }

  rowFor(id: string): IngredientBreakdown | undefined {
    return this.rowsById.get(id);
  }

  optionsFor(ingredient: RecipeIngredient): UnitOption[] {
    return ingredient.source === 'database' && ingredient.foodId
      ? unitOptions(this.getFood(ingredient.foodId))
      : unitOptions(undefined);
  }

  sourceFor(ingredient: RecipeIngredient): string {
    if (ingredient.source === 'custom') return 'Your own ingredient';
    const reference = ingredient.foodId ? this.getFood(ingredient.foodId)?.reference : undefined;
    return reference ? `Source: ${reference}` : '';
  }

  get sheetIngredient(): RecipeIngredient | undefined {
    return this.ingredients.find((i) => i.id === this.sheetId);
  }

  updateIngredient(updated: RecipeIngredient): void {
    this.ingredients = this.ingredients.map((i) => (i.id === updated.id ? updated : i));
    this.recalc();
  }

  removeIngredient(id: string): void {
    this.ingredients = this.ingredients.filter((i) => i.id !== id);
    this.recalc();
    // The button is gone; put focus somewhere sensible.
    this.ingredientsTitle?.nativeElement.focus();
  }

  private recalc(): void {
    this.result = calculateRecipe(
      { serves: this.serves, ingredients: this.ingredients },
      this.getFood,
      levelForMgPerServing
    );
    this.rowsById = new Map(this.result.breakdown.map((b) => [b.ingredientId, b]));
    this.view = summaryView(this.result, this.ingredients.length, this.foodsReady);
  }
}
