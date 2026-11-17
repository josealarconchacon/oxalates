import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { NotificationService } from 'src/app/landing-page/dialog-service/oxalate/service/notification.service';
import { RecipeService } from '../../data/recipe.service';
import { recipe } from '../../engine/testing/fixtures';
import { RecipeBuilderComponent } from './recipe-builder.component';

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
});
