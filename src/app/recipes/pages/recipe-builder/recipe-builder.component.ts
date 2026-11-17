import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, fromEvent, merge } from 'rxjs';
import { A11yModule } from '@angular/cdk/a11y';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from 'src/app/landing-page/dialog-service/oxalate/service/notification.service';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { RecipeFoodsService } from '../../data/recipe-foods.service';
import { RecipeDraftService } from '../../data/recipe-draft.service';
import { RecipeDraft, RecipeService } from '../../data/recipe.service';
import { RecipeError, validateRecipe } from '../../engine/recipe-validation';
import { formatMg } from '../../engine/format';
import { FoodLookup, calculateRecipe } from '../../engine/recipe-calculator';
import { levelForMgPerServing } from '../../engine/recipe-level';
import { UnitOption, unitOptions } from '../../engine/units';
import { IngredientBreakdown, Recipe, RecipeIngredient, RecipeResult } from '../../model/recipe';
import { LevelPillComponent } from '../../shared/level-pill/level-pill.component';
import { AmountSheetComponent } from './amount-sheet/amount-sheet.component';
import { IngredientRowComponent } from './ingredient-row/ingredient-row.component';
import { IngredientSearchComponent } from './ingredient-search/ingredient-search.component';
import { LiveSummaryComponent } from './live-summary/live-summary.component';
import { SummaryView, summaryView } from './live-summary/summary-view';
import { ServesStepperComponent } from './serves-stepper/serves-stepper.component';
import { TagPickerComponent } from './tag-picker/tag-picker.component';

/** A save that hasn't answered by then counts as failed (e.g. lost connection). */
export const SAVE_TIMEOUT_MS = 15_000;

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
    IngredientSearchComponent,
    TagPickerComponent,
    A11yModule,
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
  private breakpoints = inject(BreakpointObserver);
  private drafts = inject(RecipeDraftService);

  @ViewChild('nameInput') private nameInput?: ElementRef<HTMLInputElement>;

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    serves: new FormControl<number | null>(4),
    notes: new FormControl('', { nonNullable: true }),
  });
  ingredients: RecipeIngredient[] = [];
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
  @ViewChild('addButton') private addButton?: ElementRef<HTMLButtonElement>;

  /** The add-ingredient panel (desktop) or sheet (below 1024px) is open. */
  adding = false;
  /** Below 1024px, adding happens in a bottom sheet. */
  useSheet = false;

  mode: 'create' | 'edit' = 'create';
  state: 'loading' | 'not-found' | 'ready' = 'ready';
  saving = false;
  saveFailed = false;
  /** Validation runs after the first Save, then again on every change. */
  private submitted = false;
  errors: RecipeError[] = [];
  /** The browser is offline; a Save waits until it's back. */
  offline = typeof navigator !== 'undefined' && !navigator.onLine;
  private saveWhenOnline = false;
  /** A local draft from an earlier visit was put back into the form. */
  restoredDraft = false;
  /** Something changed since load or the last save (the leave guard uses this too). */
  dirty = false;
  private recipe: Recipe | null = null;
  private recipeId: string | null = null;
  private changes = new Subject<void>();

  ngOnInit(): void {
    this.recalc();
    this.foods.lookup$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((getFood) => {
      this.getFood = getFood;
      this.foodsReady = true;
      this.recalc();
    });
    this.breakpoints
      .observe('(max-width: 1023.98px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => (this.useSheet = state.matches));
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.changed());
    // Keep a local draft a moment after each change.
    this.changes
      .pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.keepDraft());
    merge(fromEvent(window, 'online'), fromEvent(window, 'offline'))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onConnectionChange());

    const id = this.route.snapshot.paramMap.get('id');
    this.recipeId = id;
    if (id) {
      this.mode = 'edit';
      void this.load(id);
    } else {
      this.restoreDraft();
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
      this.fill(recipe);
      this.restoreDraft();
      this.state = 'ready';
    } catch {
      this.state = 'not-found';
    }
  }

  async save(): Promise<void> {
    if (this.saving) return;
    this.submitted = true;
    this.errors = this.validate();
    if (this.errors.length) {
      this.focusFirstError();
      return;
    }
    if (this.offline) {
      // Firestore would wait silently; keep the draft and save when back.
      this.saveWhenOnline = true;
      this.keepDraft();
      return;
    }

    const { name, serves, notes } = this.form.getRawValue();
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
      const write = this.recipe
        ? this.recipes.update({ ...this.recipe, ...draft })
        : this.recipes.create(draft);
      await withTimeout(write, SAVE_TIMEOUT_MS);
      this.drafts.clear(this.recipeId);
      this.dirty = false;
      this.notifications.show('Recipe saved.', 'Close', ['success-snackbar']);
      // TODO(PR 3): open the recipe's detail page instead of the list.
      void this.router.navigate(['/recipes']);
    } catch {
      this.saveFailed = true;
    } finally {
      this.saving = false;
    }
  }

  /** Cancel: the user chose to drop their changes. */
  cancel(): void {
    this.drafts.clear(this.recipeId);
    this.dirty = false;
  }

  /** "Discard" on the restored-draft banner: back to the saved version. */
  discardDraft(): void {
    this.drafts.clear(this.recipeId);
    this.restoredDraft = false;
    this.fill(this.recipe);
    this.dirty = false;
  }

  errorFor(field: string): string | null {
    return this.errors.find((e) => e.field === field)?.message ?? null;
  }

  onTagsChange(tags: string[]): void {
    this.tags = tags;
    this.changed();
  }

  private validate(): RecipeError[] {
    const { name, serves } = this.form.getRawValue();
    return validateRecipe({ name, serves, ingredients: this.ingredients });
  }

  /** After a user edit: re-check (once Save was tried) and keep a draft. */
  private changed(): void {
    this.dirty = true;
    this.recalc();
    this.changes.next();
  }

  private fill(recipe: Recipe | null): void {
    this.form.setValue(
      { name: recipe?.name ?? '', serves: recipe?.serves ?? 4, notes: recipe?.notes ?? '' },
      { emitEvent: false }
    );
    this.ingredients = recipe?.ingredients ?? [];
    this.tags = recipe?.tags ?? [];
    this.recalc();
  }

  private restoreDraft(): void {
    const draft = this.drafts.load(this.recipeId);
    if (!draft) return;
    this.form.setValue({ name: draft.name, serves: draft.serves, notes: draft.notes }, { emitEvent: false });
    this.ingredients = draft.ingredients;
    this.tags = draft.tags;
    this.restoredDraft = true;
    this.dirty = true;
    this.recalc();
  }

  private keepDraft(): void {
    if (!this.dirty) return;
    const { name, serves, notes } = this.form.getRawValue();
    this.drafts.save(this.recipeId, { name, serves, notes, tags: this.tags, ingredients: this.ingredients });
  }

  private onConnectionChange(): void {
    this.offline = !navigator.onLine;
    if (!this.offline && this.saveWhenOnline) {
      this.saveWhenOnline = false;
      void this.save();
    }
  }

  /** Errors come name → serves → ingredients → each ingredient, as on screen. */
  private focusFirstError(): void {
    const first = this.errors[0];
    setTimeout(() => {
      if (first.field === 'name') return this.nameInput?.nativeElement.focus();
      if (first.field === 'serves') return document.getElementById('recipe-serves')?.focus();
      if (first.field === 'ingredients') return this.addButton?.nativeElement.focus();
      const row = document.querySelector(`[data-ingredient-id="${first.field}"]`);
      // The amount box on wider screens; the tappable row on phones.
      const target = [...(row?.querySelectorAll<HTMLElement>('.editor input, .open') ?? [])].find(
        (e) => e.offsetParent !== null
      );
      target?.focus();
    });
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

  openAdd(): void {
    this.adding = true;
  }

  closeAdd(): void {
    this.adding = false;
    setTimeout(() => this.addButton?.nativeElement.focus());
  }

  addIngredient(ingredient: RecipeIngredient): void {
    this.ingredients = [...this.ingredients, ingredient];
    this.changed();
  }

  updateIngredient(updated: RecipeIngredient): void {
    this.ingredients = this.ingredients.map((i) => (i.id === updated.id ? updated : i));
    this.changed();
  }

  removeIngredient(id: string): void {
    this.ingredients = this.ingredients.filter((i) => i.id !== id);
    this.changed();
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
    if (this.submitted) this.errors = this.validate();
  }
}

/** Rejects if the promise hasn't settled in time; the timer stops when it does. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Save timed out')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
