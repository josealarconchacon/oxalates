import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { BehaviorSubject, of } from 'rxjs';
import { RecipeFoodsService } from '../../data/recipe-foods.service';
import { RecipeService } from '../../data/recipe.service';
import { custom, food, grams, lookup, recipe } from '../../engine/testing/fixtures';
import { RecipeListComponent } from './recipe-list.component';

describe('RecipeListComponent', () => {
  let fixture: ComponentFixture<RecipeListComponent>;
  let list: jasmine.Spy;
  let phone: BehaviorSubject<BreakpointState>;
  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => el().textContent!.replace(/\s+/g, ' ');

  async function render() {
    fixture = TestBed.createComponent(RecipeListComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    list = jasmine.createSpy('list');
    phone = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });
    TestBed.configureTestingModule({
      imports: [RecipeListComponent],
      providers: [
        provideRouter([]),
        { provide: RecipeService, useValue: { list } },
        { provide: BreakpointObserver, useValue: { observe: () => phone } },
        {
          provide: RecipeFoodsService,
          useValue: { lookup$: of(lookup(food({ id: 'carrot', total_oxalate_mg_per_100g: '10.00' }))) },
        },
      ],
    });
  });

  it('shows skeleton rows while loading', () => {
    list.and.returnValue(new Promise(() => {}));
    fixture = TestBed.createComponent(RecipeListComponent);
    fixture.detectChanges();
    expect(el().querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(el().querySelectorAll('.rl-row--skeleton').length).toBe(3);
  });

  it('empty state invites the first recipe', async () => {
    list.and.resolveTo([]);
    await render();
    expect(text()).toContain('Cook it once, count it every time.');
    const cta = el().querySelector<HTMLAnchorElement>('.empty .btn-accent')!;
    expect(cta.textContent!.trim()).toBe('Create your first recipe');
    expect(cta.getAttribute('href')).toBe('/recipes/new');
  });

  describe('cards (641px and up)', () => {
    const card = () => el().querySelector<HTMLAnchorElement>('app-recipe-card a.card')!;
    const squash = (n: Element | null) => (n?.textContent ?? '').replace(/\s+/g, ' ').trim();
    /** The value's pieces are separate elements spaced by CSS; read them as words. */
    const value = () => Array.from(card().querySelector('.value')!.children).map((c) => squash(c)).join(' ');

    it('one link per recipe, named with the per-serving value and level', async () => {
      list.and.resolveTo([{ ...recipe([grams('carrot', 200)], 4), id: 'r9', name: 'Carrot soup', tags: [] }]);
      await render();
      expect(el().querySelectorAll('app-recipe-card').length).toBe(1);
      expect(el().querySelector('app-recipe-row')).toBeNull();
      expect(card().getAttribute('href')).toBe('/recipes/r9');
      expect(card().getAttribute('aria-label')).toBe('Carrot soup, 5.0 mg per serving, Medium');
      expect(card().querySelector('[role="img"]')!.getAttribute('aria-label')).toBe('Recipe photo');
      expect(squash(card().querySelector('.name'))).toBe('Carrot soup');
      expect(squash(card().querySelector('.serves'))).toBe('Serves 4');
      expect(value()).toBe('5.0 mg per serving');
      expect(squash(card().querySelector('app-level-pill'))).toBe('Medium');
      expect(card().querySelector('.incomplete')).toBeNull();
    });

    it('incomplete: "at least", "At least" pill and the Incomplete badge', async () => {
      list.and.resolveTo([{ ...recipe([grams('carrot', 100), custom('Tapioca', 20)]), id: 'r1', name: 'Stew' }]);
      await render();
      expect(value()).toBe('at least 10.0 mg per serving');
      expect(squash(card().querySelector('app-level-pill'))).toBe('At least Medium');
      expect(squash(card().querySelector('.incomplete'))).toBe('Incomplete');
      expect(card().getAttribute('aria-label')).toBe('Stew, at least 10.0 mg per serving, at least Medium, incomplete');
    });

    it('all ingredients unknown: "Unknown", no pill, still Incomplete', async () => {
      list.and.resolveTo([{ ...recipe([custom('Tapioca', 20)]), id: 'r1', name: 'Mystery' }]);
      await render();
      expect(value()).toBe('Unknown per serving');
      expect(card().querySelector('app-level-pill')).toBeNull();
      expect(card().querySelector('.incomplete')).not.toBeNull();
      expect(card().getAttribute('aria-label')).toBe('Mystery, oxalate per serving unknown, incomplete');
    });

    it('tags: the first 3, then "+N"', async () => {
      list.and.resolveTo([
        { ...recipe([grams('carrot', 100)]), id: 'r1', name: 'Soup', tags: ['Holiday', 'Gluten-free', 'Dairy-free', 'Low FODMAP', 'Mine'] },
      ]);
      await render();
      expect(Array.from(card().querySelectorAll('.tag')).map((t) => squash(t))).toEqual([
        'Holiday',
        'Gluten-free',
        'Dairy-free',
        '+2',
      ]);
    });
  });

  it('phones (640px and below): rows instead of cards, with 2 tags + "+N"', async () => {
    phone.next({ matches: true, breakpoints: {} });
    list.and.resolveTo([
      { ...recipe([grams('carrot', 200)], 4), id: 'r9', name: 'Carrot soup', tags: ['Holiday', 'Gluten-free', 'Dairy-free'] },
    ]);
    await render();
    expect(el().querySelector('app-recipe-card')).toBeNull();
    const row = el().querySelector<HTMLAnchorElement>('app-recipe-row a')!;
    expect(row.getAttribute('href')).toBe('/recipes/r9');
    expect(row.getAttribute('aria-label')).toBe('Carrot soup, 5.0 mg per serving, Medium');
    expect(row.querySelector('.mg')!.textContent!.trim()).toBe('5.0 mg');
    expect(row.querySelector('.meta')!.textContent!.trim()).toBe('per serving · Serves 4');
    expect(Array.from(row.querySelectorAll('.tag')).map((t) => t.textContent!.trim())).toEqual([
      'Holiday',
      'Gluten-free',
      '+1',
    ]);
  });

  it('a load error offers "Try again", which reloads', async () => {
    list.and.rejectWith(new Error('offline'));
    await render();
    expect(text()).toContain("We couldn't load your recipes.");
    list.and.resolveTo([]);
    el().querySelector<HTMLButtonElement>('.message button')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(list).toHaveBeenCalledTimes(2);
    expect(text()).toContain('Cook it once');
  });

  describe('toolbar and count', () => {
    const two = () => [
      { ...recipe([grams('carrot', 200)], 4), id: 'r1', name: 'Carrot soup' },
      { ...recipe([grams('carrot', 100)], 1), id: 'r2', name: 'Carrot salad' },
    ];

    it('has a labelled search and a sort select (Lowest oxalate first by default)', async () => {
      list.and.resolveTo(two());
      await render();
      const search = el().querySelector<HTMLInputElement>('.search-input')!;
      expect(search.closest('label')!.textContent!.trim()).toBe('Search your recipes');
      expect(search.placeholder).toBe('Search your recipes');
      const select = el().querySelector<HTMLSelectElement>('.sort-select')!;
      expect(select.closest('label')!.textContent!.trim()).toContain('Sort recipes');
      expect(Array.from(select.options).map((o) => o.textContent!.trim())).toEqual([
        'Lowest oxalate first',
        'Highest oxalate first',
        'Recently edited',
        'Name A–Z',
      ]);
      expect(select.value).toBe('lowest');
    });

    it('the count line names the sort, and is a polite live region', async () => {
      list.and.resolveTo(two());
      await render();
      const count = el().querySelector('.count')!;
      expect(count.getAttribute('aria-live')).toBe('polite');
      expect(count.textContent!.trim()).toBe('2 recipes · sorted by oxalate per serving');

      const select = el().querySelector<HTMLSelectElement>('.sort-select')!;
      select.value = 'edited';
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(count.textContent!.trim()).toBe('2 recipes · sorted by last edited');
    });

    it('one recipe reads "1 recipe"', async () => {
      list.and.resolveTo(two().slice(0, 1));
      await render();
      expect(el().querySelector('.count')!.textContent!.trim()).toBe('1 recipe · sorted by oxalate per serving');
    });

    it('no toolbar or count on the first-time page or the error', async () => {
      list.and.resolveTo([]);
      await render();
      expect(el().querySelector('.toolbar')).toBeNull();
      expect(el().querySelector('.count')).toBeNull();
    });
  });

  describe('search and sort on the page', () => {
    const names = () =>
      Array.from(el().querySelectorAll('app-recipe-card .name')).map((n) => n.textContent!.trim());
    const recipes = () => [
      { ...recipe([grams('carrot', 300)]), id: 'a', name: 'Carrot soup', tags: ['Holiday'], updatedAt: '2026-11-01T00:00:00.000Z' },
      { ...recipe([grams('carrot', 100)]), id: 'b', name: 'Crème brûlée', tags: [], updatedAt: '2026-11-18T00:00:00.000Z' },
      { ...recipe([custom('Mystery', 10)]), id: 'c', name: 'Apple mystery', tags: [], updatedAt: '2026-11-10T00:00:00.000Z' },
    ];

    function renderSync() {
      list.and.resolveTo(recipes());
      fixture = TestBed.createComponent(RecipeListComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }

    it('starts lowest first, unknown last', fakeAsync(() => {
      renderSync();
      expect(names()).toEqual(['Crème brûlée', 'Carrot soup', 'Apple mystery']);
    }));

    it('sort changes the order and the count', fakeAsync(() => {
      renderSync();
      const select = el().querySelector<HTMLSelectElement>('.sort-select')!;
      select.value = 'name';
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(names()).toEqual(['Apple mystery', 'Carrot soup', 'Crème brûlée']);
      select.value = 'edited';
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(names()).toEqual(['Crème brûlée', 'Apple mystery', 'Carrot soup']);
    }));

    it('search waits 200 ms, ignores accents, and updates the count', fakeAsync(() => {
      renderSync();
      const input = el().querySelector<HTMLInputElement>('.search-input')!;
      input.value = 'creme';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick(199);
      fixture.detectChanges();
      expect(names().length).toBe(3);
      tick(1);
      fixture.detectChanges();
      expect(names()).toEqual(['Crème brûlée']);
      expect(el().querySelector('.count')!.textContent!.trim()).toBe('1 recipe · sorted by oxalate per serving');
    }));

    it('search also finds tags', fakeAsync(() => {
      renderSync();
      const input = el().querySelector<HTMLInputElement>('.search-input')!;
      input.value = 'holiday';
      input.dispatchEvent(new Event('input'));
      tick(200);
      fixture.detectChanges();
      expect(names()).toEqual(['Carrot soup']);
    }));
  });

  describe('tag chips', () => {
    const chips = () => Array.from(el().querySelectorAll<HTMLButtonElement>('[role="group"] .chip'));
    const chip = (label: string) => chips().find((c) => c.textContent!.trim() === label)!;
    const names = () => Array.from(el().querySelectorAll('app-recipe-card .name')).map((n) => n.textContent!.trim());

    beforeEach(async () => {
      list.and.resolveTo([
        { ...recipe([grams('carrot', 100)]), id: 'a', name: 'Soup', tags: ['Gluten-free', 'Holiday'] },
        { ...recipe([grams('carrot', 200)]), id: 'b', name: 'Stew', tags: ['Gluten-free', 'Party'] },
        { ...recipe([grams('carrot', 300)]), id: 'c', name: 'Salad', tags: [] },
      ]);
      await render();
    });

    it('a labelled group: All, the six suggestions, then your own tags', () => {
      expect(el().querySelector('[role="group"]')!.getAttribute('aria-label')).toBe('Filter by tag');
      expect(chips().map((c) => c.textContent!.trim())).toEqual([
        'All',
        'Low histamine',
        'Gluten-free',
        'Dairy-free',
        'Low FODMAP',
        'Drink/Smoothie',
        'Holiday',
        'Party',
      ]);
      expect(chip('All').getAttribute('aria-pressed')).toBe('true');
      expect(chip('Holiday').getAttribute('aria-pressed')).toBe('false');
    });

    it('toggling chips filters to recipes with ALL of them; All clears', () => {
      chip('Gluten-free').click();
      fixture.detectChanges();
      expect(chip('Gluten-free').getAttribute('aria-pressed')).toBe('true');
      expect(chip('All').getAttribute('aria-pressed')).toBe('false');
      expect(names()).toEqual(['Soup', 'Stew']);
      expect(el().querySelector('.count')!.textContent!.trim()).toBe('2 recipes · sorted by oxalate per serving');

      chip('Holiday').click();
      fixture.detectChanges();
      expect(names()).toEqual(['Soup']);

      chip('Holiday').click(); // toggles off again
      fixture.detectChanges();
      expect(names()).toEqual(['Soup', 'Stew']);

      chip('All').click();
      fixture.detectChanges();
      expect(names()).toEqual(['Soup', 'Stew', 'Salad']);
      expect(chips().filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.textContent!.trim())).toEqual(['All']);
    });

    it('a chosen chip shows a check icon', () => {
      chip('Party').click();
      fixture.detectChanges();
      expect(chip('Party').querySelector('app-icon')).not.toBeNull();
      expect(chip('All').querySelector('app-icon')).toBeNull();
    });
  });
});
