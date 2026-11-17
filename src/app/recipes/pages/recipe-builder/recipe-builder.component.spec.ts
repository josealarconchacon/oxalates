import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { NotificationService } from 'src/app/landing-page/dialog-service/oxalate/service/notification.service';
import { OxalateService } from 'src/app/landing-page/dialog-service/service/oxalate.service';
import { of } from 'rxjs';
import { RecipeFoodsService } from '../../data/recipe-foods.service';
import { RecipeService } from '../../data/recipe.service';
import { custom, food, grams, lookup, recipe, servings } from '../../engine/testing/fixtures';
import { RecipeBuilderComponent } from './recipe-builder.component';

const foods = lookup(
  food({ id: 'carrot', item: 'Carrot', total_oxalate_mg_per_100g: '10.00', total_soluble_oxalate_mg_per_100g: '4.00', reference: 'LO Cookbook 2' }),
  food({ id: 'rice', item: 'Rice', serving_size: '1 cup', serving_g: '195.00', calc_oxalate_per_serving: '4.90', total_oxalate_mg_per_100g: '2.50' })
);

describe('RecipeBuilderComponent', () => {
  let fixture: ComponentFixture<RecipeBuilderComponent>;
  let service: jasmine.SpyObj<RecipeService>;
  let notify: jasmine.Spy;
  let navigate: jasmine.Spy;
  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => el().textContent!.replace(/\s+/g, ' ');

  async function render(id: string | null = null) {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } },
    });
    fixture = TestBed.createComponent(RecipeBuilderComponent);
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function type(selector: string, value: string) {
    const input = el().querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  async function submit() {
    el().querySelector<HTMLFormElement>('#recipe-form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    service = jasmine.createSpyObj('RecipeService', ['get', 'create', 'update']);
    notify = jasmine.createSpy('show');
    TestBed.configureTestingModule({
      imports: [RecipeBuilderComponent],
      providers: [
        provideRouter([]),
        { provide: RecipeService, useValue: service },
        { provide: NotificationService, useValue: { show: notify } },
        { provide: RecipeFoodsService, useValue: { lookup$: of(foods) } },
        { provide: OxalateService, useValue: { searchOxalateData: () => of([]) } },
      ],
    });
  });

  describe('create', () => {
    beforeEach(() => render());

    it('is titled "New recipe" and starts with Serves 4', () => {
      expect(el().querySelector('h1')!.textContent).toBe('New recipe');
      expect(el().querySelector<HTMLInputElement>('#recipe-serves')!.value).toBe('4');
      expect(text()).toContain('Save recipe');
      expect(text()).not.toContain('Past days keep');
    });

    it('needs a name: shows the error, focuses the field, saves nothing', async () => {
      await submit();
      const name = el().querySelector<HTMLInputElement>('#recipe-name')!;
      expect(el().querySelector('#recipe-name-error')!.textContent).toBe('Give your recipe a name.');
      expect(name.getAttribute('aria-describedby')).toBe('recipe-name-error');
      expect(document.activeElement).toBe(name);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('saves the trimmed name, serves and notes, then shows the toast and goes to the list', async () => {
      service.create.and.callFake(async (d) => ({ ...recipe([]), ...d }));
      type('#recipe-name', '  Carrot soup ');
      type('#recipe-notes', 'Simmer 20 min.');
      el().querySelector<HTMLButtonElement>('[aria-label="More servings"]')!.click();
      await submit();
      expect(service.create).toHaveBeenCalledWith({
        name: 'Carrot soup',
        serves: 5,
        notes: 'Simmer 20 min.',
        tags: [],
        ingredients: [],
      });
      expect(notify).toHaveBeenCalledWith('Recipe saved.', 'Close', ['success-snackbar']);
      expect(navigate).toHaveBeenCalledWith(['/recipes']);
    });

    it('saves the tags picked in the tag picker', async () => {
      service.create.and.callFake(async (d) => ({ ...recipe([]), ...d }));
      type('#recipe-name', 'Smoothie');
      el().querySelector<HTMLButtonElement>('app-tag-picker .chip--add')!.click();
      fixture.detectChanges();
      [...el().querySelectorAll<HTMLButtonElement>('app-tag-picker .option')]
        .find((o) => o.textContent!.trim() === 'Drink/Smoothie')!
        .click();
      fixture.detectChanges();
      await submit();
      expect(service.create.calls.mostRecent().args[0].tags).toEqual(['Drink/Smoothie']);
    });

    it('a failed save keeps everything and offers "Try again"', async () => {
      service.create.and.rejectWith(new Error('offline'));
      type('#recipe-name', 'Carrot soup');
      await submit();
      expect(text()).toContain("We couldn't save your recipe. Your changes are still here.");
      expect(el().querySelector<HTMLInputElement>('#recipe-name')!.value).toBe('Carrot soup');
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('edit', () => {
    const stored = { ...recipe([], 3), id: 'r1', name: 'Soup', notes: 'Stir.', tags: ['Gluten-free'] };

    it('loads the recipe into the form', async () => {
      service.get.and.resolveTo(stored);
      await render('r1');
      expect(service.get).toHaveBeenCalledWith('r1');
      expect(el().querySelector('h1')!.textContent).toBe('Edit recipe');
      expect(el().querySelector<HTMLInputElement>('#recipe-name')!.value).toBe('Soup');
      expect(el().querySelector<HTMLInputElement>('#recipe-serves')!.value).toBe('3');
      expect(el().querySelector<HTMLTextAreaElement>('#recipe-notes')!.value).toBe('Stir.');
      expect(text()).toContain('Save changes');
      expect(text()).toContain('Past days keep the numbers they were logged with.');
    });

    it('updates the same recipe, keeping fields it does not edit', async () => {
      service.get.and.resolveTo(stored);
      service.update.and.callFake(async (r) => r);
      await render('r1');
      type('#recipe-name', 'Better soup');
      await submit();
      expect(service.update).toHaveBeenCalledWith(
        jasmine.objectContaining({ id: 'r1', name: 'Better soup', tags: ['Gluten-free'], createdAt: stored.createdAt })
      );
      expect(service.create).not.toHaveBeenCalled();
    });

    it("a missing recipe shows \"We couldn't find that recipe.\"", async () => {
      service.get.and.resolveTo(null);
      await render('nope');
      expect(text()).toContain("We couldn't find that recipe.");
      expect(el().querySelector('#recipe-form')).toBeNull();
    });
  });

  describe('ingredients and the live total', () => {
    const summary = () => el().querySelector('app-live-summary')!.textContent!.replace(/\s+/g, ' ');

    async function editWith(ingredients: any[], serves = 2) {
      service.get.and.resolveTo({ ...recipe(ingredients, serves), id: 'r1' });
      await render('r1');
    }

    it('shows each ingredient with its source and mg, and the totals', async () => {
      await editWith([grams('carrot', 200, 'Carrot'), servings('rice', 2, 'Rice')]);
      const rows = el().querySelectorAll('app-ingredient-row');
      expect(rows.length).toBe(2);
      expect(rows[0].textContent).toContain('Source: LO Cookbook 2');
      expect(rows[0].textContent).toContain('20.0 mg');
      expect(rows[1].textContent).toContain('9.8 mg'); // 2 × 4.9 measured per cup
      expect(el().querySelector('.section-meta')!.textContent).toBe('2 · 29.8 mg');
      expect(summary()).toContain('14.9 mg'); // 29.8 ÷ 2 servings
      expect(summary()).toMatch(/Whole recipe\s*29\.8 mg/);
    });

    it('recomputes when Serves changes', async () => {
      await editWith([grams('carrot', 200, 'Carrot')]);
      el().querySelector<HTMLButtonElement>('[aria-label="More servings"]')!.click();
      fixture.detectChanges();
      expect(summary()).toContain('6.7 mg'); // 20 ÷ 3
    });

    it('recomputes as an amount is typed', async () => {
      await editWith([grams('carrot', 200, 'Carrot')]);
      const amount = el().querySelector<HTMLInputElement>('[aria-label="Amount of Carrot"]')!;
      amount.value = '300';
      amount.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(el().querySelector('.section-meta')!.textContent).toBe('1 · 30.0 mg');
    });

    it('an unknown ingredient reads "Unknown" and makes totals "at least"', async () => {
      await editWith([grams('carrot', 200, 'Carrot'), custom('Tapioca starch', 30)]);
      expect(el().querySelectorAll('app-ingredient-row')[1].textContent).toContain('Unknown');
      expect(summary()).toContain('at least');
      expect(summary()).toContain('Incomplete');
      expect(summary()).toContain('No oxalate value for: Tapioca starch');
    });

    it('removing an ingredient updates the totals and keeps focus in the list', async () => {
      await editWith([grams('carrot', 200, 'Carrot'), grams('carrot', 100, 'More carrot')]);
      el().querySelector<HTMLButtonElement>('[aria-label="Remove More carrot"]')!.click();
      fixture.detectChanges();
      expect(el().querySelectorAll('app-ingredient-row').length).toBe(1);
      expect(el().querySelector('.section-meta')!.textContent).toBe('1 · 20.0 mg');
      expect(document.activeElement!.id).toBe('ingredients-title');
    });

    it('Enter in an amount field does not save the recipe', async () => {
      await editWith([grams('carrot', 200, 'Carrot')]);
      const amount = el().querySelector<HTMLInputElement>('[aria-label="Amount of Carrot"]')!;
      const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
      amount.dispatchEvent(enter);
      expect(enter.defaultPrevented).toBeTrue();
    });

    it('saves the edited ingredients', async () => {
      await editWith([grams('carrot', 200, 'Carrot')]);
      service.update.and.callFake(async (r) => r);
      const amount = el().querySelector<HTMLInputElement>('[aria-label="Amount of Carrot"]')!;
      amount.value = '50';
      amount.dispatchEvent(new Event('input'));
      await submit();
      expect(service.update.calls.mostRecent().args[0].ingredients[0]).toEqual(
        jasmine.objectContaining({ grams: 50, inputAmount: 50, inputUnit: 'g' })
      );
    });

    it('phones: the row opens an amount sheet that applies changes and closes on Done', async () => {
      await editWith([servings('rice', 2, 'Rice')]);
      el().querySelector<HTMLButtonElement>('.open')!.click();
      fixture.detectChanges();
      const sheet = el().querySelector('app-amount-sheet [role="dialog"]')!;
      expect(sheet.getAttribute('aria-modal')).toBe('true');
      const amount = sheet.querySelector<HTMLInputElement>('input')!;
      amount.value = '1';
      amount.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(sheet.textContent).toContain('4.9 mg');
      sheet.querySelector<HTMLButtonElement>('.done')!.click();
      fixture.detectChanges();
      expect(el().querySelector('app-amount-sheet')).toBeNull();
    });

    it('the empty recipe says how to start', async () => {
      await render();
      expect(summary()).toContain('Add an ingredient to see the total.');
    });
  });

  describe('add ingredient', () => {
    beforeEach(() => render());

    it('"Add ingredient" opens the search; a picked food becomes a row; Close returns focus', async () => {
      el().querySelector<HTMLButtonElement>('.add-btn')!.click();
      fixture.detectChanges();
      const search = el().querySelector('app-ingredient-search')!;
      expect(search).not.toBeNull();

      search.dispatchEvent(new Event('noop'));
      fixture.debugElement
        .query((d) => d.name === 'app-ingredient-search')
        .componentInstance.added.emit({ ...grams('carrot', 150, 'Carrot') });
      fixture.detectChanges();
      expect(el().querySelectorAll('app-ingredient-row').length).toBe(1);
      expect(el().querySelector('.section-meta')!.textContent).toBe('1 · 15.0 mg');

      fixture.debugElement
        .query((d) => d.name === 'app-ingredient-search')
        .componentInstance.added.emit(custom('Tapioca starch', 30));
      fixture.detectChanges();
      const rows = el().querySelectorAll('app-ingredient-row');
      expect(rows[1].textContent).toContain('Your own ingredient');
      expect(rows[1].textContent).toContain('Unknown');
      expect(el().querySelector('.section-meta')!.textContent).toBe('2 · at least 15.0 mg');
      expect(el().querySelector('app-live-summary')!.textContent).toContain('No oxalate value for: Tapioca starch');

      el().querySelector<HTMLButtonElement>('app-ingredient-search [aria-label="Close"]')!.click();
      fixture.detectChanges();
      await new Promise((r) => setTimeout(r));
      expect(el().querySelector('app-ingredient-search')).toBeNull();
      expect(document.activeElement).toBe(el().querySelector('.add-btn'));
    });
  });
});
