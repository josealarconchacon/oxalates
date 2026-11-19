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
import { dayTotals, localDayKey } from 'src/app/user-auth/profile/food-entry/model/day-totals';
import { FoodEntryService, MealKey } from 'src/app/user-auth/profile/food-entry/service/food-entry.service';
import { Recipe, RecipeResult } from '../../../model/recipe';
import { defaultMeal } from '../../../shared/log/log-defaults';
import { DayState, LogPreviewComponent } from '../../../shared/log/log-preview.component';
import { onRadioKey } from '../../../shared/log/radio-keys';
import { ServingsFieldComponent } from '../../../shared/log/servings-field.component';

export const MEALS: { key: MealKey; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snacks', label: 'Snacks' },
];

/** What the user chose; the page saves it. */
export interface LogServingChoice {
  dayKey: string;
  meal: MealKey;
  multiplier: number;
}

/** "Log a serving": pick a day, a meal and how many servings; see what it adds. */
@Component({
  selector: 'app-log-serving',
  standalone: true,
  imports: [
    A11yModule,
    DatePipe,
    IconComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    ServingsFieldComponent,
    LogPreviewComponent,
  ],
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
  @ViewChild(ServingsFieldComponent, { static: true }) servings!: ServingsFieldComponent;

  readonly meals = MEALS;

  day = startOfDay(new Date());
  meal: MealKey = defaultMeal();
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

  /** A day after today: the log is a plan. */
  get isFuture(): boolean {
    return localDayKey(this.day) > localDayKey(new Date());
  }

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
    return this.servings.multiplier;
  }

  selectMeal = (meal: MealKey) => (this.meal = meal);

  onMealKey(event: KeyboardEvent): void {
    onRadioKey(event, MEALS.map((m) => m.key), this.meal, this.selectMeal);
  }

  // --- Footer ---

  submit(): void {
    if (this.saving) return;
    if (this.servings.invalid) {
      this.servings.focusCustom();
      return;
    }
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
