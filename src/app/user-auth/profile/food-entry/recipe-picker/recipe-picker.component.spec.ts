import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RecipeFoodsService } from 'src/app/recipes/data/recipe-foods.service';
import { RecipeService } from 'src/app/recipes/data/recipe.service';
import { custom, food, grams, lookup, recipe } from 'src/app/recipes/engine/testing/fixtures';
import { Recipe } from 'src/app/recipes/model/recipe';
import { RecipePick, RecipePickerComponent } from './recipe-picker.component';

describe('RecipePickerComponent', () => {
  let fixture: ComponentFixture<RecipePickerComponent>;
  let list: jasmine.Spy;
  const el = () => fixture.nativeElement as HTMLElement;
  const squash = (n: Element | null) => (n?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const search = () => el().querySelector<HTMLInputElement>('[role="combobox"]')!;
  const options = () => Array.from(el().querySelectorAll<HTMLElement>('[role="option"]'));

  // Carrot 10 mg/100 g. Soup: 200 g, serves 2 → 10.0 mg per serving (Medium).
  const foods = lookup(food({ id: 'carrot', item: 'Carrot' }));
  const soup: Recipe = { ...recipe([grams('carrot', 200, 'Carrot')], 2), id: 'r1', name: 'Carrot soup' };
  const stew: Recipe = { ...recipe([grams('carrot', 100, 'Carrot'), custom('Tapioca', 10)], 1), id: 'r2', name: 'Tapioca stew' };

  async function render(recipes: Recipe[] | Error = [soup, stew]) {
    list = jasmine.createSpy('list');
    recipes instanceof Error ? list.and.rejectWith(recipes) : list.and.resolveTo(recipes);
    TestBed.configureTestingModule({
      imports: [RecipePickerComponent],
      providers: [
        provideRouter([]),
        { provide: RecipeService, useValue: { list } },
        { provide: RecipeFoodsService, useValue: { lookup$: of(foods) } },
      ],
    });
    fixture = TestBed.createComponent(RecipePickerComponent);
    fixture.componentRef.setInput('mealType', 'lunch');
    fixture.componentRef.setInput('dayTotals', { mg: 12, solubleMg: 3, atLeast: false, solubleAtLeast: false });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const key = (k: string) => {
    search().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    fixture.detectChanges();
  };

  it('heads the dialog "Add to <Meal>" and lists your recipes with mg per serving, level and Incomplete', async () => {
    await render();
    expect(squash(el().querySelector('#add-food-title'))).toBe('Add to Lunch');
    expect(search().getAttribute('aria-label')).toBe('Search your recipes');
    expect(options().map((o) => squash(o.querySelector('.option-name')))).toEqual(['Carrot soup', 'Tapioca stew']);
    expect(squash(options()[0].querySelector('.option-mg'))).toBe('10.0 mg per serving');
    expect(squash(options()[0].querySelector('app-level-pill'))).toBe('Medium');
    expect(squash(options()[1].querySelector('.option-mg'))).toBe('at least 10.0 mg per serving');
    expect(squash(options()[1].querySelector('.incomplete'))).toBe('Incomplete');
  });

  it('search filters; ↑/↓ move the highlight (aria-activedescendant); Enter picks', async () => {
    await render();
    search().value = 'stew';
    search().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(options().length).toBe(1);
    expect(search().getAttribute('aria-activedescendant')).toBe('recipe-option-0');

    search().value = '';
    search().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    key('ArrowDown');
    expect(options()[1].getAttribute('aria-selected')).toBe('true');
    key('ArrowDown'); // wraps
    expect(options()[0].getAttribute('aria-selected')).toBe('true');
    document.body.appendChild(el());
    search().focus();
    key('Enter');
    expect(squash(el().querySelector('.chosen .option-name'))).toBe('Carrot soup');
    await new Promise((r) => setTimeout(r));
    // The search box is gone: focus moves to the chosen servings chip.
    expect(document.activeElement!.getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement!.textContent!.trim()).toBe('1');
    el().remove();
  });

  it('no match: says so', async () => {
    await render();
    search().value = 'pizza';
    search().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(squash(el().querySelector('.status'))).toBe('No recipes match “pizza”.');
  });

  it('after picking: servings, a preview with the day total, and Log Food emits the pick', async () => {
    await render();
    options()[0].click();
    fixture.detectChanges();
    expect(squash(el().querySelector('.adds'))).toBe('Adds 10.0 mg to Lunch');
    expect(squash(el().querySelector('.before'))).toBe('12.0 mg');
    expect(squash(el().querySelector('.after'))).toBe('22.0 mg');

    const chips = Array.from(el().querySelectorAll<HTMLButtonElement>('[aria-labelledby="log-servings-label"] [role="radio"]'));
    chips[0].click(); // ½
    fixture.detectChanges();
    expect(squash(el().querySelector('.adds'))).toBe('Adds 5.0 mg to Lunch');

    const picked: RecipePick[] = [];
    fixture.componentInstance.pick.subscribe((p) => picked.push(p));
    const log = el().querySelector<HTMLButtonElement>('.log-btn')!;
    expect(squash(log)).toBe('Log Food');
    log.click();
    expect(picked.length).toBe(1);
    expect(picked[0].recipe.id).toBe('r1');
    expect(picked[0].multiplier).toBe(0.5);
  });

  it('Change goes back to the list', async () => {
    await render();
    options()[0].click();
    fixture.detectChanges();
    el().querySelector<HTMLButtonElement>('.chosen button')!.click();
    fixture.detectChanges();
    expect(options().length).toBe(2);
  });

  it('no recipes yet: says so and links to Create a recipe', async () => {
    await render([]);
    expect(squash(el().querySelector('.empty p'))).toBe("You don't have any recipes yet.");
    expect(el().querySelector('.empty a')!.getAttribute('href')).toBe('/recipes/new');
  });

  it("can't load: offers Try again", async () => {
    await render(new Error('offline'));
    expect(squash(el().querySelector('[role="alert"] p'))).toBe("We couldn't load your recipes.");
    list.and.resolveTo([soup]);
    el().querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(options().length).toBe(1);
  });

  it('saving and error states', async () => {
    await render();
    options()[0].click();
    fixture.componentRef.setInput('saving', true);
    fixture.componentRef.setInput('error', true);
    fixture.detectChanges();
    expect(squash(el().querySelector('.log-btn'))).toBe('Adding…');
    expect(squash(el().querySelector('.error'))).toBe("We couldn't add this to your day. Try again.");
  });
});
