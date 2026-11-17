import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { RecipeService } from '../../data/recipe.service';
import { grams, recipe } from '../../engine/testing/fixtures';
import { RecipeDetailComponent } from './recipe-detail.component';

describe('RecipeDetailComponent', () => {
  let fixture: ComponentFixture<RecipeDetailComponent>;
  let get: jasmine.Spy;
  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => el().textContent!.replace(/\s+/g, ' ');

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
});
