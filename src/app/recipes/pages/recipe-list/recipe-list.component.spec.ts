import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RecipeFoodsService } from '../../data/recipe-foods.service';
import { RecipeService } from '../../data/recipe.service';
import { custom, food, grams, lookup, recipe } from '../../engine/testing/fixtures';
import { RecipeListComponent } from './recipe-list.component';

describe('RecipeListComponent', () => {
  let fixture: ComponentFixture<RecipeListComponent>;
  let list: jasmine.Spy;
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
    TestBed.configureTestingModule({
      imports: [RecipeListComponent],
      providers: [
        provideRouter([]),
        { provide: RecipeService, useValue: { list } },
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

  it('a row shows name, serves and per-serving mg, and links to its detail page', async () => {
    list.and.resolveTo([{ ...recipe([grams('carrot', 200)], 4), id: 'r9', name: 'Carrot soup' }]);
    await render();
    const row = el().querySelector<HTMLAnchorElement>('a.rl-row')!;
    expect(row.getAttribute('href')).toBe('/recipes/r9');
    expect(row.textContent).toContain('Carrot soup');
    expect(row.textContent).toContain('Serves 4');
    expect(row.textContent!.replace(/\s+/g, ' ')).toContain('5.0 mg per serving');
    expect(row.querySelector('.badge')).toBeNull();
  });

  it('an incomplete recipe says "at least" and shows the Incomplete badge', async () => {
    list.and.resolveTo([{ ...recipe([grams('carrot', 100), custom('Tapioca', 20)]), id: 'r1' }]);
    await render();
    const row = el().querySelector('a.rl-row')!;
    expect(row.textContent).toContain('at least');
    expect(row.querySelector('.badge')!.textContent!.trim()).toBe('Incomplete');
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
});
