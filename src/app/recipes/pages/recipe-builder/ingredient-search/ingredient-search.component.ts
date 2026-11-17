import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, map, of, switchMap, tap } from 'rxjs';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { OxalateService } from 'src/app/landing-page/dialog-service/service/oxalate.service';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { RecipeIngredient } from '../../../model/recipe';
import { formatMg } from '../../../engine/format';
import { foodValues } from '../../../engine/food-values';
import { calculateIngredient } from '../../../engine/recipe-calculator';
import { UnitOption, formatGrams, unitOptions } from '../../../engine/units';
import { LevelPillComponent } from '../../../shared/level-pill/level-pill.component';
import { AmountEditorComponent } from '../amount-editor/amount-editor.component';

export const SEARCH_DEBOUNCE_MS = 250;
const MAX_RESULTS = 8;
let nextId = 0;

/**
 * Add an ingredient: search the food list → pick a food → amount → Add.
 * Used inline on desktop and inside a bottom sheet on smaller screens.
 */
@Component({
  selector: 'app-ingredient-search',
  standalone: true,
  imports: [IconComponent, LevelPillComponent, AmountEditorComponent],
  templateUrl: './ingredient-search.component.html',
  styleUrl: './ingredient-search.component.css',
})
export class IngredientSearchComponent implements AfterViewInit {
  private oxalates = inject(OxalateService);
  private destroyRef = inject(DestroyRef);

  @Output() added = new EventEmitter<RecipeIngredient>();
  @Output() closed = new EventEmitter<void>();
  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

  readonly listId = `food-results-${nextId++}`;
  query = '';
  results: Oxalate[] = [];
  loading = false;
  active = -1;

  /** The amount step. */
  picked: Oxalate | null = null;
  draft: RecipeIngredient | null = null;
  options: UnitOption[] = [];
  /** Read out after an add ("Added Rice."). */
  announcement = '';

  /** The "add it yourself" step, for foods that aren't in the list. */
  addingCustom = false;
  customName = '';
  customGrams = '100';
  customError: string | null = null;

  private queries = new Subject<string>();

  constructor() {
    this.queries
      .pipe(
        map((q) => q.trim()),
        // No distinctUntilChanged: after an add, the same query must search
        // again. Repeats are cheap (OxalateService caches results).
        debounceTime(SEARCH_DEBOUNCE_MS),
        tap((q) => (this.loading = q.length >= 2)),
        switchMap((q) => (q.length < 2 ? of([]) : this.oxalates.searchOxalateData(q))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((foods) => {
        this.results = foods.slice(0, MAX_RESULTS);
        this.active = this.results.length ? 0 : -1;
        this.loading = false;
      });
  }

  ngAfterViewInit(): void {
    this.focusSearch();
  }

  get trimmedQuery(): string {
    return this.query.trim();
  }

  optionId(i: number): string {
    return `${this.listId}-${i}`;
  }

  onQuery(value: string): void {
    this.query = value;
    if (value.trim().length < 2) {
      this.results = [];
      this.active = -1;
    }
    this.queries.next(value);
  }

  /** ↑/↓ move through the results, Enter picks, Esc closes. */
  onSearchKey(event: KeyboardEvent): void {
    const n = this.results.length;
    if (event.key === 'ArrowDown' && n) {
      this.active = (this.active + 1) % n;
    } else if (event.key === 'ArrowUp' && n) {
      this.active = (this.active - 1 + n) % n;
    } else if (event.key === 'Enter') {
      if (this.active >= 0 && this.results[this.active]) this.pick(this.results[this.active]);
    } else if (event.key === 'Escape') {
      this.closed.emit();
    } else {
      return;
    }
    event.preventDefault();
  }

  /** "Vegetables · 1.3 mg per 1/2 cup" */
  meta(food: Oxalate): string {
    const v = foodValues(food);
    const amount =
      v.mgPerServing !== null && v.servingLabel
        ? `${formatMg(v.mgPerServing)} mg per ${v.servingLabel}`
        : v.mgPer100g !== null
          ? `${formatMg(v.mgPer100g)} mg per 100 g`
          : 'Oxalate unknown';
    return food.category ? `${food.category} · ${amount}` : amount;
  }

  /** The food's own level; none for "uncalculated". */
  levelOf(food: Oxalate): string | null {
    const level = String(food.calc_level ?? '').trim();
    return level && level.toLowerCase() !== 'uncalculated' ? level : null;
  }

  pick(food: Oxalate): void {
    this.picked = food;
    this.options = unitOptions(food);
    const serving = this.options.find((o) => o.unit === 'serving');
    // Start with one household serving when there is one, else 100 g.
    this.draft = {
      id: newId(),
      source: 'database',
      foodId: String(food.id),
      name: food.item.trim(),
      ...(serving
        ? { inputUnit: 'serving', inputAmount: 1, grams: serving.servingGrams, servingLabel: serving.servingLabel ?? undefined }
        : { inputUnit: 'g', inputAmount: 100, grams: 100 }),
    };
    setTimeout(() => this.focusAmount());
  }

  /** mg for the amount being chosen, before it's added. */
  get draftMg(): string {
    if (!this.draft || !this.picked || !(this.draft.inputAmount > 0)) return '';
    const row = calculateIngredient(this.draft, () => this.picked ?? undefined);
    return row.mg !== null ? `${formatMg(row.mg)} mg` : 'Oxalate unknown for this amount';
  }

  get draftAmountText(): string {
    const d = this.draft;
    if (!d) return '';
    return d.inputUnit === 'g' ? `${formatGrams(d.inputAmount)} g` : `${formatGrams(d.inputAmount)} × ${d.servingLabel}`;
  }

  add(): void {
    if (!this.draft || !(this.draft.inputAmount > 0)) return;
    this.added.emit(this.draft);
    this.announcement = `Added ${this.draft.name}.`;
    // Ready for the next one.
    this.backToSearch(true);
  }

  startCustom(): void {
    this.addingCustom = true;
    this.customName = this.trimmedQuery;
    this.customGrams = '100';
    this.customError = null;
    setTimeout(() => this.focusById(`${this.listId}-custom-name`));
  }

  /** An ingredient that isn't in the food list: oxalate unknown, grams only. */
  addCustom(): void {
    const name = this.customName.trim();
    const grams = Number(this.customGrams.replace(',', '.'));
    if (!name) {
      this.customError = 'Give your ingredient a name.';
      this.focusById(`${this.listId}-custom-name`);
      return;
    }
    if (!(grams > 0)) {
      this.customError = 'Enter an amount above 0.';
      this.focusById(`${this.listId}-custom-grams`);
      return;
    }
    this.added.emit({ id: newId(), source: 'custom', name, grams, inputAmount: grams, inputUnit: 'g' });
    this.announcement = `Added ${name}.`;
    this.backToSearch(true);
  }

  backToSearch(clear = false): void {
    this.addingCustom = false;
    this.customError = null;
    this.picked = null;
    this.draft = null;
    if (clear) {
      this.query = '';
      this.results = [];
      this.active = -1;
      this.queries.next('');
    }
    setTimeout(() => this.focusSearch());
  }

  focusSearch(): void {
    this.searchInput?.nativeElement.focus();
  }

  private focusAmount(): void {
    (document.querySelector(`#${this.listId}-amount input`) as HTMLInputElement | null)?.focus();
  }

  private focusById(id: string): void {
    document.getElementById(id)?.focus();
  }
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `i${Date.now()}${Math.random().toString(36).slice(2)}`;
}
