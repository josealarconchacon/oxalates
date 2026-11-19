import { A11yModule } from '@angular/cdk/a11y';
import { DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { BehaviorSubject, catchError, map, of, switchMap } from 'rxjs';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { Totals, dayTotals, localDayKey, snapshotTotals, sumTotals } from 'src/app/user-auth/profile/food-entry/model/day-totals';
import { FoodEntryService, MealKey } from 'src/app/user-auth/profile/food-entry/service/food-entry.service';
import { formatMg } from '../../../engine/format';
import { createLogSnapshot } from '../../../engine/recipe-snapshot';
import { Recipe, RecipeLogSnapshot, RecipeResult } from '../../../model/recipe';
import { LevelPillComponent } from '../../../shared/level-pill/level-pill.component';

export const MEALS: { key: MealKey; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snacks', label: 'Snacks' },
];

export type ServingChoice = 0.5 | 1 | 2 | 'custom';
export const SERVING_CHOICES: { value: ServingChoice; label: string }[] = [
  { value: 0.5, label: '½' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 'custom', label: 'Custom' },
];

/** What the user chose; saving happens in the page (step 6). */
export interface LogServingChoice {
  dayKey: string;
  meal: MealKey;
  multiplier: number;
}

/** The day's current total, or why we don't have it. */
type DayState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; totals: Totals };

/** "Log a serving": pick a day, a meal and how many servings; see what it adds. */
@Component({
  selector: 'app-log-serving',
  standalone: true,
  imports: [A11yModule, DatePipe, IconComponent, LevelPillComponent, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './log-serving.component.html',
  styleUrl: './log-serving.component.css',
})
export class LogServingComponent implements OnInit {
  private entries = inject(FoodEntryService);
  private destroyRef = inject(DestroyRef);

  @Input({ required: true }) recipe!: Recipe;
  @Input({ required: true }) result!: RecipeResult;
  /** Busy saving: the footer button waits. */
  @Input() saving = false;
  /** The last save failed. */
  @Input() error = false;
  @Output() add = new EventEmitter<LogServingChoice>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('picker') private picker?: MatDatepicker<Date>;

  readonly meals = MEALS;
  readonly servingChoices = SERVING_CHOICES;

  day = startOfDay(new Date());
  meal: MealKey = 'breakfast';
  serving: ServingChoice = 1;
  customServings = 1;
  dayState: DayState = { status: 'loading' };

  private day$ = new BehaviorSubject<Date>(this.day);

  ngOnInit(): void {
    this.day$
      .pipe(
        switchMap((day) => {
          this.dayState = { status: 'loading' };
          // getDailyEntry keys by the UTC date, so pass midnight UTC of the local day.
          return this.entries.getDailyEntry(new Date(`${localDayKey(day)}T00:00:00Z`)).pipe(
            map((entry): DayState => ({ status: 'ready', totals: entry ? dayTotals(entry) : dayTotals(EMPTY_DAY) })),
            catchError(() => of<DayState>({ status: 'error' }))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((state) => (this.dayState = state));
  }

  // --- Day ---

  get isToday(): boolean {
    return localDayKey(this.day) === localDayKey(new Date());
  }

  moveDay(by: number): void {
    const next = new Date(this.day);
    next.setDate(next.getDate() + by);
    this.setDay(next);
  }

  setDay(date: Date | null): void {
    if (!date) return;
    this.day = startOfDay(date);
    this.day$.next(this.day);
  }

  openPicker(): void {
    this.picker?.open();
  }

  /** Same as Daily Intake's date switcher: the popup lives on <body>, so give it the theme. */
  onPickerOpened(): void {
    const dark = document.documentElement.classList.contains('dark-theme');
    setTimeout(() => document.querySelector('.mat-datepicker-popup')?.classList.toggle('dark-theme', dark));
  }

  // --- Meal and servings ---

  get mealLabel(): string {
    return MEALS.find((m) => m.key === this.meal)!.label;
  }

  get multiplier(): number {
    return this.serving === 'custom' ? this.customServings : this.serving;
  }

  /** Arrow keys move the choice within a radiogroup (and focus follows). */
  onRadioKey<T>(event: KeyboardEvent, values: T[], current: T, select: (value: T) => void): void {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    const edge = { Home: 0, End: values.length - 1 }[event.key];
    if (step === undefined && edge === undefined) return;
    event.preventDefault();
    const index = edge ?? (values.indexOf(current) + step! + values.length) % values.length;
    select(values[index]);
    // The radios are the same elements before and after, so focus can move now
    // (a timer here lets quick repeated presses act on the old radio).
    const group = (event.currentTarget as HTMLElement).closest('[role="radiogroup"]');
    group?.querySelectorAll<HTMLElement>('[role="radio"]')[index]?.focus();
  }

  selectMeal = (meal: MealKey) => (this.meal = meal);
  selectServing = (value: ServingChoice) => (this.serving = value);
  get mealKeys(): MealKey[] {
    return MEALS.map((m) => m.key);
  }
  get servingValues(): ServingChoice[] {
    return SERVING_CHOICES.map((c) => c.value);
  }

  // --- Preview (display only; the saved snapshot comes from the same engine call) ---

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
    if (this.dayState.status !== 'ready') return null;
    const before = this.dayState.totals;
    const after = sumTotals([before, snapshotTotals(this.snapshot)]);
    const text = (t: Totals) => `${t.atLeast ? 'at least ' : ''}${formatMg(t.mg)} mg`;
    return { before: text(before), after: text(after) };
  }

  // --- Footer ---

  submit(): void {
    if (this.saving) return;
    this.add.emit({ dayKey: localDayKey(this.day), meal: this.meal, multiplier: this.multiplier });
  }

  close(): void {
    if (!this.saving) this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    // Esc in the date picker closes only the picker.
    if (this.picker?.opened) return;
    this.close();
  }
}

const EMPTY_DAY = { breakfast: [], lunch: [], dinner: [], snacks: [] };

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
