import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { BehaviorSubject, of } from 'rxjs';
import { NotificationService } from 'src/app/landing-page/dialog-service/oxalate/service/notification.service';
import { RecipeFoodsService } from '../../data/recipe-foods.service';
import { RecipeService } from '../../data/recipe.service';
import { custom, food, grams, lookup, recipe } from '../../engine/testing/fixtures';
import { Recipe } from '../../model/recipe';
import { RecipeDetailComponent } from './recipe-detail.component';

describe('RecipeDetailComponent', () => {
  let fixture: ComponentFixture<RecipeDetailComponent>;
  let get: jasmine.Spy;
  let create: jasmine.Spy;
  let remove: jasmine.Spy;
  let toast: jasmine.Spy;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let screen: BehaviorSubject<BreakpointState>;
  /** Pretend the window is this wide (the page's breakpoints: ≥ 1024, ≤ 640). */
  const widthOf = (px: number): BreakpointState => {
    const breakpoints = { '(min-width: 1024px)': px >= 1024, '(max-width: 640px)': px <= 640 };
    return { matches: Object.values(breakpoints).some(Boolean), breakpoints };
  };
  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => el().textContent!.replace(/\s+/g, ' ');
  const squash = (node: Element | null) => node!.textContent!.replace(/\s+/g, ' ').trim();
  /** "Per serving 10.0 mg": the tile's label and value, read as two parts. */
  const tileText = (tile: Element) => `${squash(tile.querySelector('.tile-label'))} ${squash(tile.querySelector('.big'))}`;

  async function render() {
    fixture = TestBed.createComponent(RecipeDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    get = jasmine.createSpy('get');
    create = jasmine.createSpy('create');
    remove = jasmine.createSpy('remove');
    toast = jasmine.createSpy('show');
    params = new BehaviorSubject(convertToParamMap({ id: 'r1' }));
    screen = new BehaviorSubject(widthOf(1440));
    TestBed.configureTestingModule({
      imports: [RecipeDetailComponent],
      providers: [
        provideRouter([]),
        { provide: RecipeService, useValue: { get, create, remove } },
        { provide: NotificationService, useValue: { show: toast } },
        {
          provide: RecipeFoodsService,
          useValue: {
            lookup$: of(
              lookup(
                food({ id: 'carrot', item: 'Carrot' }),
                food({ id: 'nosol', item: 'Kale', total_soluble_oxalate_mg_per_100g: 'n/a', calc_soluble_mg_oxalate_per_serving: 'n/a' })
              )
            ),
          },
        },
        { provide: ActivatedRoute, useValue: { paramMap: params } },
        { provide: BreakpointObserver, useValue: { observe: () => screen } },
      ],
    });
  });

  it('loads the recipe from the URL and shows its name as the one h1', async () => {
    get.and.resolveTo({ ...recipe([grams('carrot', 100)]), id: 'r1', name: 'Carrot soup' });
    await render();
    expect(get).toHaveBeenCalledWith('r1');
    const h1s = el().querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent!.trim()).toBe('Carrot soup');
    expect(el().querySelector('.back')!.getAttribute('href')).toBe('/recipes');
  });

  it("not found (or not yours): says so and links back", async () => {
    get.and.resolveTo(null);
    await render();
    expect(text()).toContain("We couldn't find that recipe.");
    expect(el().querySelector('.message a')!.getAttribute('href')).toBe('/recipes');
  });

  it('load error: offers Try again', async () => {
    get.and.rejectWith(new Error('offline'));
    await render();
    expect(text()).toContain("We couldn't load this recipe.");
    get.and.resolveTo({ ...recipe([]), id: 'r1', name: 'Soup' });
    el().querySelector<HTMLButtonElement>('.message button')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el().querySelector('h1')!.textContent!.trim()).toBe('Soup');
  });

  describe('title block', () => {
    // Carrot: 10 mg and 4 mg soluble per 100 g. 200 g, serves 2 → 10.0 mg (Medium) and 4.0 mg soluble per serving.
    const soup = (over: Partial<Recipe> = {}): Recipe => ({
      ...recipe([grams('carrot', 200, 'Carrot')], 2),
      id: 'r1',
      name: 'Carrot soup',
      tags: ['Dinner', 'Kid-friendly'],
      updatedAt: new Date().toISOString(),
      ...over,
    });

    it('shows the photo placeholder, tags, serves + edited date, level and both tiles', async () => {
      get.and.resolveTo(soup());
      await render();
      const photo = el().querySelector('.photo')!;
      expect(photo.getAttribute('role')).toBe('img');
      expect(photo.getAttribute('aria-label')).toBe('Recipe photo');
      expect(Array.from(el().querySelectorAll('.tag')).map((t) => t.textContent!.trim())).toEqual(['Dinner', 'Kid-friendly']);
      expect(el().querySelector('.meta')!.textContent).toMatch(/^Serves 2 · Edited [A-Z][a-z]{2} \d{1,2}$/);
      expect(el().querySelector('app-level-pill')!.textContent!.trim()).toBe('Medium');
      const tiles = Array.from(el().querySelectorAll('.tile')).map(tileText);
      expect(tiles).toEqual(['Per serving 10.0 mg', 'Soluble per serving 4.0 mg']);
      expect(el().querySelector('.whole')!.textContent!.replace(/\s+/g, ' ').trim()).toBe(
        'Whole recipe: 20.0 mg · soluble 8.0 mg'
      );
    });

    it('adds the year when the recipe was edited in another year, and hides empty tags', async () => {
      get.and.resolveTo(soup({ tags: [], updatedAt: '2024-03-05T12:00:00.000Z' }));
      await render();
      expect(el().querySelector('.meta')!.textContent).toBe('Serves 2 · Edited Mar 5, 2024');
      expect(el().querySelector('.tags')).toBeNull();
    });

    it('incomplete: numbers and level read "at least"', async () => {
      get.and.resolveTo(soup({ ingredients: [grams('carrot', 200, 'Carrot'), custom('Tapioca starch', 20)] }));
      await render();
      expect(el().querySelector('app-level-pill')!.textContent!.trim()).toBe('At least Medium');
      expect(tileText(el().querySelector('.tile')!)).toBe('Per serving at least 10.0 mg');
      expect(el().querySelector('.whole')!.textContent).toContain('Whole recipe: at least 20.0 mg');
    });

    it('no soluble data at all: the soluble tile says Unknown and the whole line leaves it out', async () => {
      get.and.resolveTo(soup({ ingredients: [grams('nosol', 100, 'Kale')] }));
      await render();
      const tiles = el().querySelectorAll('.tile');
      expect(tileText(tiles[1])).toBe('Soluble per serving Unknown');
      expect(el().querySelector('.whole')!.textContent).not.toContain('soluble');
    });
  
    it('incomplete: shows the Incomplete badge with the unknown names', async () => {
      get.and.resolveTo(soup({ ingredients: [grams('carrot', 200, 'Carrot'), custom('Tapioca starch', 20)] }));
      await render();
      const badge = el().querySelector('app-incomplete-badge')!;
      expect(badge).not.toBeNull();
      badge.querySelector<HTMLButtonElement>('.badge')!.click();
      fixture.detectChanges();
      expect(squash(badge.querySelector('.text'))).toContain('no oxalate value for Tapioca starch.');
    });

    it('complete: no badge', async () => {
      get.and.resolveTo(soup());
      await render();
      expect(el().querySelector('app-incomplete-badge')).toBeNull();
    });

    it('all ingredients unknown: tiles say Unknown, no level pill, the badge still shows', async () => {
      get.and.resolveTo(soup({ ingredients: [custom('Tapioca starch', 20), custom('Mystery spice', 5)] }));
      await render();
      const tiles = Array.from(el().querySelectorAll('.tile')).map(tileText);
      expect(tiles).toEqual(['Per serving Unknown', 'Soluble per serving Unknown']);
      expect(el().querySelector('app-level-pill')).toBeNull();
      expect(el().querySelector('app-incomplete-badge')).not.toBeNull();
      expect(squash(el().querySelector('.whole'))).toBe('Whole recipe: Unknown');
      expect(el().querySelector('.calm-note')).toBeNull();
    });

    it('soluble missing on some rows only: only the soluble numbers read "at least"', async () => {
      get.and.resolveTo(soup({ ingredients: [grams('carrot', 200, 'Carrot'), grams('nosol', 100, 'Kale')] }));
      await render();
      const tiles = Array.from(el().querySelectorAll('.tile')).map(tileText);
      expect(tiles[0]).not.toContain('at least');
      expect(tiles[1]).toContain('at least');
      expect(el().querySelector('app-level-pill')!.textContent!.trim()).not.toContain('At least');
      expect(el().querySelector('app-incomplete-badge')).toBeNull();
    });

    it('High or above: a calm note, with no swap promise', async () => {
      // 340 g carrot, serves 2 → 17.0 mg per serving (High).
      get.and.resolveTo(soup({ ingredients: [grams('carrot', 340, 'Carrot')] }));
      await render();
      expect(el().querySelector('app-level-pill')!.textContent!.trim()).toBe('High');
      expect(squash(el().querySelector('.calm-note'))).toBe('This one is on the higher side.');
      expect(text()).not.toContain('swap');
    });

    it('below High: no note', async () => {
      get.and.resolveTo(soup());
      await render();
      expect(el().querySelector('.calm-note')).toBeNull();
    });
  });

  describe("What's driving this", () => {
    const soup = (): Recipe => ({
      ...recipe([grams('carrot', 200, 'Carrot'), custom('Tapioca starch', 20)], 2),
      id: 'r1',
      name: 'Carrot soup',
    });

    it('lists each ingredient with mg, share and a bar; unknown rows last', async () => {
      get.and.resolveTo(soup());
      await render();
      const card = el().querySelector('app-recipe-breakdown')!;
      expect(squash(card.querySelector('h2'))).toBe("What's driving this");
      expect(squash(card.querySelector('.sub'))).toBe("Whole recipe, highest first. Bars show each ingredient's share of 20.0 mg.");
      const items = Array.from(card.querySelectorAll('li'));
      expect(items.map((li) => li.getAttribute('aria-label'))).toEqual([
        'Carrot, 200 g, 20.0 mg, 100 percent of total',
        'Tapioca starch, 20 g, oxalate unknown',
      ]);
      expect(items[0].querySelector<HTMLElement>('.fill')!.style.width).toBe('100%');
      expect(squash(items[1].querySelector('.mg'))).toBe('Unknown');
      expect(squash(items[1].querySelector('.pct'))).toBe('—');
      expect(items[1].querySelector('.track')).toBeNull();
    });

    it('a name in the Incomplete popover moves focus to its row', async () => {
      const r = soup();
      get.and.resolveTo(r);
      await render();
      document.body.appendChild(el());
      el().querySelector<HTMLButtonElement>('app-incomplete-badge .badge')!.click();
      fixture.detectChanges();
      el().querySelector<HTMLAnchorElement>('#incomplete-popover a')!.click();
      fixture.detectChanges();
      expect(document.activeElement!.id).toBe('ing-' + r.ingredients[1].id);
      el().remove();
    });
  });

  describe('Show sources', () => {
    const KEY = 'recipe-show-sources:u1';
    const sw = () => el().querySelector<HTMLButtonElement>('[role="switch"]')!;
    const sources = () => Array.from(el().querySelectorAll('.source')).map((p) => squash(p));

    beforeEach(() => localStorage.removeItem(KEY));
    afterEach(() => localStorage.removeItem(KEY));

    it('is off by default, a labelled switch, and shows source lines when turned on', async () => {
      get.and.resolveTo({ ...recipe([grams('carrot', 100, 'Carrot'), custom('Tapioca starch', 10)]), id: 'r1' });
      await render();
      expect(squash(sw())).toBe('Show sources');
      expect(sw().getAttribute('aria-checked')).toBe('false');
      expect(sources()).toEqual([]);

      sw().click();
      fixture.detectChanges();
      expect(sw().getAttribute('aria-checked')).toBe('true');
      expect(sources()).toEqual(['Source: Test', 'Your own ingredient']);
      expect(el().querySelector('li')!.getAttribute('aria-label')).toBe('Carrot, 100 g, 10.0 mg, 100 percent of total, Source: Test');
      expect(localStorage.getItem(KEY)).toBe('true');
    });

    it('remembers the choice for this user', async () => {
      localStorage.setItem(KEY, 'true');
      get.and.resolveTo({ ...recipe([grams('carrot', 100, 'Carrot')]), id: 'r1' });
      await render();
      expect(sw().getAttribute('aria-checked')).toBe('true');
      expect(sources()).toEqual(['Source: Test']);
    });

    it('a food no longer in the list says so even with sources off', async () => {
      get.and.resolveTo({ ...recipe([grams('carrot', 100, 'Carrot'), grams('gone', 50, 'Old kale')]), id: 'r1' });
      await render();
      expect(sources()).toEqual(['No longer in the food list']);
    });
  });

  describe('notes, medical note and data date', () => {
    it('shows notes as written, line breaks kept', async () => {
      const notes = '1. Boil the carrots.\n2. Drain and mash.';
      get.and.resolveTo({ ...recipe([grams('carrot', 100)]), id: 'r1', notes });
      await render();
      const card = el().querySelector('.notes')!;
      expect(squash(card.querySelector('h2'))).toBe('Notes and steps');
      expect(card.querySelector('.notes-text')!.textContent).toBe(notes);
      expect(getComputedStyle(card.querySelector('.notes-text')!).whiteSpace).toBe('pre-wrap');
    });

    it('hides the notes card when there are no notes', async () => {
      get.and.resolveTo({ ...recipe([grams('carrot', 100)]), id: 'r1', notes: '   ' });
      await render();
      expect(el().querySelector('.notes')).toBeNull();
    });

    it('always shows the medical note and the food data date', async () => {
      get.and.resolveTo({ ...recipe([]), id: 'r1' });
      await render();
      expect(squash(el().querySelector('.medical-text'))).toBe(
        'These numbers are estimates from published food lists. Cooking, like boiling and draining, can change the real amount. Check with your clinician before changing your diet.'
      );
      expect(squash(el().querySelector('.data-date'))).toBe('Data updated: Jul 27, 2024');
    });
  });

  describe('Edit / Duplicate / Delete', () => {
    const soup = (): Recipe => ({
      ...recipe([grams('carrot', 200, 'Carrot')], 2),
      id: 'r1',
      name: 'Carrot soup',
      notes: 'Boil.',
      tags: ['Dinner'],
    });
    const button = (label: string) =>
      Array.from(el().querySelectorAll<HTMLButtonElement>('.actions button')).find((b) => squash(b).includes(label))!;
    const dialog = () => document.querySelector('app-delete-dialog [role="alertdialog"]');
    let navigate: jasmine.Spy;

    beforeEach(async () => {
      get.and.resolveTo(soup());
      await render();
      document.body.appendChild(el());
      navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    });

    afterEach(() => el().remove());

    it('Edit links to the builder', () => {
      expect(el().querySelector('.actions a')!.getAttribute('href')).toBe('/recipes/r1/edit');
    });

    it('Duplicate creates "Copy of <name>" and opens the copy with a toast', async () => {
      const r = fixture.componentInstance.recipe!;
      create.and.resolveTo({ ...r, id: 'r2', name: 'Copy of Carrot soup' });
      button('Duplicate').click();
      await fixture.whenStable();
      expect(create).toHaveBeenCalledWith({
        name: 'Copy of Carrot soup',
        serves: 2,
        ingredients: r.ingredients,
        notes: 'Boil.',
        tags: ['Dinner'],
        photoUrl: undefined,
      });
      expect(toast).toHaveBeenCalledWith('Copy created.', 'Close', ['success-snackbar']);
      expect(navigate).toHaveBeenCalledWith(['/recipes', 'r2']);
    });

    it('the page follows the URL to the copy', async () => {
      get.and.resolveTo({ ...soup(), id: 'r2', name: 'Copy of Carrot soup' });
      params.next(convertToParamMap({ id: 'r2' }));
      // next() runs outside Angular's zone, so wait for the load ourselves.
      await new Promise((resolve) => setTimeout(resolve));
      fixture.detectChanges();
      expect(get).toHaveBeenCalledWith('r2');
      expect(squash(el().querySelector('h1'))).toBe('Copy of Carrot soup');
    });

    it('Duplicate error: says so and stays', async () => {
      create.and.rejectWith(new Error('offline'));
      button('Duplicate').click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(squash(el().querySelector('.action-error'))).toBe("We couldn't duplicate this recipe. Try again.");
      expect(navigate).not.toHaveBeenCalled();
    });

    it('Delete asks first, with focus on Cancel; Cancel closes it', async () => {
      button('Delete').click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(squash(dialog()!.querySelector('h2'))).toBe('Delete “Carrot soup”?');
      expect(squash(dialog()!.querySelector('p'))).toBe("This can't be undone. Days you already logged keep their numbers.");
      expect(document.activeElement!.textContent!.trim()).toBe('Cancel');

      (document.activeElement as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(dialog()).toBeNull();
      expect(remove).not.toHaveBeenCalled();
    });

    it('Esc closes the dialog', () => {
      button('Delete').click();
      fixture.detectChanges();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(dialog()).toBeNull();
    });

    it('Delete recipe removes it, then goes to Recipes with a toast', async () => {
      remove.and.resolveTo();
      button('Delete').click();
      fixture.detectChanges();
      dialog()!.querySelector<HTMLButtonElement>('.btn--danger')!.click();
      await fixture.whenStable();
      expect(remove).toHaveBeenCalledWith('r1');
      expect(toast).toHaveBeenCalledWith('Recipe deleted.', 'Close', ['success-snackbar']);
      expect(navigate).toHaveBeenCalledWith(['/recipes']);
    });

    it('Delete error: the dialog stays open and says so', async () => {
      remove.and.rejectWith(new Error('offline'));
      button('Delete').click();
      fixture.detectChanges();
      dialog()!.querySelector<HTMLButtonElement>('.btn--danger')!.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(squash(dialog()!.querySelector('[role="alert"]'))).toBe("We couldn't delete this recipe. Try again.");
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('actions by screen width', () => {
    const actions = () => el().querySelector('.actions')!;
    const labels = () =>
      Array.from(actions().querySelectorAll('a, button')).map((b) => b.getAttribute('aria-label') ?? squash(b));

    beforeEach(() => get.and.resolveTo({ ...recipe([grams('carrot', 100)]), id: 'r1', name: 'Soup' }));

    it('≥ 1024px: Edit, Duplicate and Delete with text', async () => {
      await render();
      expect(labels()).toEqual(['Edit', 'Duplicate', 'Delete']);
    });

    it('641–1023px: Edit + a More menu with Duplicate and Delete', async () => {
      screen.next(widthOf(768));
      await render();
      expect(labels()).toEqual(['Edit', 'More actions']);
      const more = actions().querySelector<HTMLButtonElement>('[aria-label="More actions"]')!;
      expect(more.getAttribute('aria-haspopup')).toBe('menu');
      more.click();
      fixture.detectChanges();
      const items = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
      expect(items.map((i) => squash(i))).toEqual(['Duplicate', 'Delete']);
      items[1].click();
      fixture.detectChanges();
      expect(document.querySelector('app-delete-dialog')).not.toBeNull();
    });

    it('≤ 640px: three 44px icon buttons with labels', async () => {
      screen.next(widthOf(390));
      await render();
      expect(labels()).toEqual(['Edit', 'Duplicate', 'Delete']);
      expect(Array.from(actions().children).every((b) => b.classList.contains('btn-icon'))).toBeTrue();
      expect(squash(actions())).toBe('');
    });
  });

  describe('states', () => {
    it('loading: a skeleton shaped like the page (title, two tiles, four rows)', async () => {
      get.and.returnValue(new Promise(() => {}));
      fixture = TestBed.createComponent(RecipeDetailComponent);
      fixture.detectChanges();
      const sk = el().querySelector('.skeleton')!;
      expect(sk.getAttribute('aria-busy')).toBe('true');
      expect(sk.getAttribute('aria-label')).toBe('Loading recipe');
      expect(sk.querySelectorAll('.sk--title').length).toBe(1);
      expect(sk.querySelectorAll('.sk--tile').length).toBe(2);
      expect(sk.querySelectorAll('.sk--row').length).toBe(4);
      expect(el().querySelector('h1')).toBeNull();
    });

    it('a food no longer in the list: keeps its name, counts as unknown, and says why', async () => {
      get.and.resolveTo({ ...recipe([grams('carrot', 100, 'Carrot'), grams('gone', 50, 'Old kale')]), id: 'r1' });
      await render();
      const rows = Array.from(el().querySelectorAll('app-recipe-breakdown li'));
      const gone = rows.find((li) => li.getAttribute('aria-label')!.startsWith('Old kale'))!;
      expect(squash(gone.querySelector('.mg'))).toBe('Unknown');
      expect(squash(gone.querySelector('.source'))).toBe('No longer in the food list');
      expect(el().querySelector('app-incomplete-badge')).not.toBeNull();
      expect(el().querySelector('app-level-pill')!.textContent!.trim()).toMatch(/^At least /);
    });
  });
});
