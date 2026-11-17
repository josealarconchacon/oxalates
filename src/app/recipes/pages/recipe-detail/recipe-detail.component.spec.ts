import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RecipeFoodsService } from '../../data/recipe-foods.service';
import { RecipeService } from '../../data/recipe.service';
import { custom, food, grams, lookup, recipe } from '../../engine/testing/fixtures';
import { Recipe } from '../../model/recipe';
import { RecipeDetailComponent } from './recipe-detail.component';

describe('RecipeDetailComponent', () => {
  let fixture: ComponentFixture<RecipeDetailComponent>;
  let get: jasmine.Spy;
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
    TestBed.configureTestingModule({
      imports: [RecipeDetailComponent],
      providers: [
        provideRouter([]),
        { provide: RecipeService, useValue: { get } },
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
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'r1' }) } } },
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
});
