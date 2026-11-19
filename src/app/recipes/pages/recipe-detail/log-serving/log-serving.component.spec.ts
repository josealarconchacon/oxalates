import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BehaviorSubject, throwError } from 'rxjs';
import { localDayKey } from 'src/app/user-auth/profile/food-entry/model/day-totals';
import { DailyFoodEntry, FoodEntryService } from 'src/app/user-auth/profile/food-entry/service/food-entry.service';
import { calculateRecipe } from '../../../engine/recipe-calculator';
import { levelForMgPerServing } from '../../../engine/recipe-level';
import { custom, food, grams, lookup, recipe } from '../../../engine/testing/fixtures';
import { Recipe } from '../../../model/recipe';
import { LogServingComponent } from './log-serving.component';

describe('LogServingComponent', () => {
  let fixture: ComponentFixture<LogServingComponent>;
  let day$: BehaviorSubject<DailyFoodEntry | null>;
  let requested: Date[];
  const el = () => fixture.nativeElement as HTMLElement;
  const squash = (node: Element | null) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const radios = (label: string) =>
    Array.from(el().querySelectorAll<HTMLButtonElement>(`[aria-labelledby="${label}"] [role="radio"]`));

  // Carrot: 10 mg and 4 mg soluble per 100 g. 200 g, serves 2 → 10.0 mg per serving (Medium).
  const foods = lookup(food({ id: 'carrot', item: 'Carrot' }));
  const soup = (ingredients = [grams('carrot', 200, 'Carrot')]): Recipe => ({ ...recipe(ingredients, 2), name: 'Carrot soup' });

  const spinachDay = (mg: number): DailyFoodEntry => ({
    date: '',
    breakfast: [{ foodName: 'Spinach', oxalatePerServing: mg, solubleOxalatePerServing: 1, servingSize: '1 cup', numberOfServings: 1 }],
    lunch: [],
    dinner: [],
    snacks: [],
  });

  function render(r: Recipe = soup(), getDailyEntry?: (d: Date) => unknown) {
    day$ = new BehaviorSubject<DailyFoodEntry | null>(spinachDay(12));
    requested = [];
    TestBed.configureTestingModule({
      imports: [LogServingComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: FoodEntryService,
          useValue: { getDailyEntry: getDailyEntry ?? ((d: Date) => (requested.push(d), day$)) },
        },
      ],
    });
    fixture = TestBed.createComponent(LogServingComponent);
    fixture.componentRef.setInput('recipe', r);
    fixture.componentRef.setInput('result', calculateRecipe(r, foods, levelForMgPerServing));
    fixture.detectChanges();
    document.body.appendChild(el());
  }

  afterEach(() => el().remove());

  it('is a labelled modal dialog with the recipe name and a Close button', () => {
    render();
    const dialog = el().querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(squash(el().querySelector('#log-title'))).toBe('Log a serving');
    expect(squash(el().querySelector('#log-recipe'))).toBe('Carrot soup');
    expect(el().querySelector('[aria-label="Close"]')).not.toBeNull();
    expect(el().querySelector('.grab')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('day: today by default, with the Today tag; arrows move a day and load that day', () => {
    render();
    expect(squash(el().querySelector('.today'))).toBe('Today');
    expect(requested[0].toISOString().slice(0, 10)).toBe(localDayKey(new Date()));

    el().querySelector<HTMLButtonElement>('[aria-label="Previous day"]')!.click();
    fixture.detectChanges();
    expect(el().querySelector('.today')).toBeNull();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(requested[1].toISOString().slice(0, 10)).toBe(localDayKey(yesterday));
    expect(el().querySelector('[aria-label="Next day"]')).not.toBeNull();
    expect(el().querySelector('[aria-label^="Pick a date"]')).not.toBeNull();
  });

  it('meal: a radiogroup; arrow keys move the choice and the button label follows', () => {
    render();
    const meals = radios('log-meal-label');
    expect(meals.map((m) => squash(m))).toEqual(['Breakfast', 'Lunch', 'Dinner', 'Snacks']);
    expect(meals.map((m) => m.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false', 'false']);
    expect(meals.map((m) => m.tabIndex)).toEqual([0, -1, -1, -1]);

    meals[0].focus();
    meals[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(radios('log-meal-label')[1].getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(radios('log-meal-label')[1]); // focus follows at once
    expect(squash(el().querySelector('.btn--primary'))).toBe('Add to Lunch');

    radios('log-meal-label')[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    radios('log-meal-label')[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(radios('log-meal-label')[3].getAttribute('aria-checked')).toBe('true'); // wraps around
  });

  it('servings: ½ · 1 · 2 · Custom, 1 by default; the preview follows', () => {
    render();
    const chips = radios('log-servings-label');
    expect(chips.map((c) => squash(c))).toEqual(['½', '1', '2', 'Custom']);
    expect(chips[1].getAttribute('aria-checked')).toBe('true');
    expect(squash(el().querySelector('.adds'))).toBe('Adds 10.0 mg to Breakfast');
    expect(squash(el().querySelector('app-level-pill'))).toBe('Medium');
    expect(squash(el().querySelector('.soluble'))).toBe('Soluble 4.0 mg');

    chips[2].click();
    fixture.detectChanges();
    expect(squash(el().querySelector('.adds'))).toBe('Adds 20.0 mg to Breakfast');
  });

  it('preview: day total before → after', () => {
    render();
    expect(squash(el().querySelector('.before'))).toBe('12.0 mg');
    expect(squash(el().querySelector('.after'))).toBe('22.0 mg');

    day$.next(spinachDay(30)); // the day changes elsewhere: the preview keeps up
    fixture.detectChanges();
    expect(squash(el().querySelector('.after'))).toBe('40.0 mg');
  });

  it('incomplete recipe: "Adds at least", and the new day total is "at least"', () => {
    render(soup([grams('carrot', 200, 'Carrot'), custom('Tapioca starch', 20)]));
    expect(squash(el().querySelector('.adds'))).toBe('Adds at least 10.0 mg to Breakfast');
    expect(squash(el().querySelector('app-level-pill'))).toBe('At least Medium');
    expect(squash(el().querySelector('.before'))).toBe('12.0 mg');
    expect(squash(el().querySelector('.after'))).toBe('at least 22.0 mg');
  });

  it('all ingredients unknown: "Adds an unknown amount", no level pill', () => {
    render(soup([custom('Tapioca starch', 20)]));
    expect(squash(el().querySelector('.adds'))).toBe('Adds an unknown amount to Breakfast');
    expect(el().querySelector('app-level-pill')).toBeNull();
    expect(squash(el().querySelector('.after'))).toBe('at least 12.0 mg');
  });

  it("the day can't load: says so, the rest still works", () => {
    render(soup(), () => throwError(() => new Error('offline')));
    expect(squash(el().querySelector('.day-total'))).toContain("We couldn't load this day.");
  });

  it('Add emits the day key, meal and servings', () => {
    render();
    const added: unknown[] = [];
    fixture.componentInstance.add.subscribe((c) => added.push(c));
    radios('log-meal-label')[2].click();
    radios('log-servings-label')[0].click();
    fixture.detectChanges();
    el().querySelector<HTMLButtonElement>('.btn--primary')!.click();
    expect(added).toEqual([{ dayKey: localDayKey(new Date()), meal: 'dinner', multiplier: 0.5 }]);
  });

  it('saving and error states', () => {
    render();
    fixture.componentRef.setInput('saving', true);
    fixture.componentRef.setInput('error', true);
    fixture.detectChanges();
    const add = el().querySelector<HTMLButtonElement>('.btn--primary')!;
    expect(squash(add)).toBe('Adding…');
    expect(add.disabled).toBeTrue();
    expect(squash(el().querySelector('[role="alert"]'))).toBe("We couldn't add this to your day. Try again.");
  });

  it('Esc, Cancel and Close close it', () => {
    render();
    let closed = 0;
    fixture.componentInstance.closed.subscribe(() => closed++);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    el().querySelector<HTMLButtonElement>('.btn--outline')!.click();
    el().querySelector<HTMLButtonElement>('[aria-label="Close"]')!.click();
    expect(closed).toBe(3);
  });
});
