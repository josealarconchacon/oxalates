import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodEntryComponent, dayFromParam } from './food-entry.component';
import { AngularFireModule } from '@angular/fire/compat';
import {
  AngularFirestoreModule,
  AngularFirestore,
} from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { RecipeService } from 'src/app/recipes/data/recipe.service';
import { recipeEntry } from './recipe-entry/recipe-entry.component.spec';

class MockAngularFirestore {
  collection() {
    return {
      add: jasmine.createSpy('add').and.returnValue(Promise.resolve()),
      valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of([])),
    };
  }
}

describe('FoodEntryComponent', () => {
  let component: FoodEntryComponent;
  let fixture: ComponentFixture<FoodEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FoodEntryComponent,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule,
      ],
      providers: [
        { provide: AngularFirestore, useClass: MockAngularFirestore },
        { provide: RecipeService, useValue: { list: () => Promise.resolve([{ id: 'r1' }]) } },
        provideRouter([]),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading announcement', () => {
    const status = () =>
      (
        fixture.nativeElement.querySelector('[role="status"]') as HTMLElement
      ).textContent!.trim();

    it('keeps one status region in the page and updates its text', () => {
      component.isLoading = true;
      fixture.detectChanges();
      const region = fixture.nativeElement.querySelector('[role="status"]');
      expect(status()).toBe('Loading your food entries.');

      component.isLoading = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="status"]')).toBe(region);
      expect(status()).toBe('Food entries loaded.');
    });
  });

  describe('while the day is loading', () => {
    beforeEach(() => {
      component.isLoading = true;
      fixture.detectChanges();
    });

    it('still draws the four meal sections, with placeholders', () => {
      const titles = [
        ...fixture.nativeElement.querySelectorAll('.meal-title'),
      ].map((h: HTMLElement) => h.textContent!.trim());

      expect(titles).toEqual(['Breakfast', 'Lunch', 'Dinner', 'Snacks']);
      expect(
        fixture.nativeElement.querySelectorAll('.meal-skeleton').length
      ).toBe(4);
      // No "No foods added yet" until we actually know the day is empty
      expect(fixture.nativeElement.querySelector('.empty-state')).toBeNull();
    });

    it('keeps Add Food disabled, so a save cannot overwrite unloaded foods', () => {
      const buttons = [
        ...fixture.nativeElement.querySelectorAll('.add-button'),
      ] as HTMLButtonElement[];

      expect(buttons.length).toBe(4);
      expect(buttons.every((b) => b.disabled)).toBeTrue();
    });

    it('ignores openCalculator until loading finishes', () => {
      component.openCalculator('lunch');
      expect(component.showCalculator).toBeFalse();

      component.isLoading = false;
      component.openCalculator('lunch');
      expect(component.showCalculator).toBeTrue();
    });
  });

  describe('expandable food rows', () => {
    const el = (selector: string) =>
      fixture.nativeElement.querySelector(selector) as HTMLElement | null;

    beforeEach(() => {
      component.isLoading = false;
      component.breakfastItems = [
        {
          foodName: 'Almonds',
          servingSize: '1 oz',
          numberOfServings: 1,
          oxalatePerServing: 122,
          solubleOxalatePerServing: 30,
          isExpanded: false,
        },
      ];
    });

    describe('in the meal cards (narrow at every width)', () => {
      beforeEach(() => {
        fixture.detectChanges();
      });

      it('makes the name a button that says whether it is expanded', () => {
        const button = el('button.food-name-btn')!;

        expect(button).toBeTruthy();
        expect(button.getAttribute('aria-expanded')).toBe('false');
      });

      it('updates aria-expanded and shows the details when pressed', () => {
        const button = el('button.food-name-btn')!;

        button.click();
        fixture.detectChanges();

        expect(button.getAttribute('aria-expanded')).toBe('true');
        expect(el('.mobile-details')).toBeTruthy();
      });

      it('hides the +/- glyph from assistive technology', () => {
        expect(el('.expand-icon')!.getAttribute('aria-hidden')).toBe('true');
      });

      it('has a button type so it can never submit a form', () => {
        expect(el('button.food-name-btn')!.getAttribute('type')).toBe('button');
      });
    });
  });

  it('names the page like the header link, for screen readers', () => {
    const h1 = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(h1.textContent!.trim()).toBe('Calculate Daily Intake');
  });

  describe('meal cards', () => {
    beforeEach(() => {
      component.isLoading = false;
      fixture.detectChanges();
    });

    it('shows the four meals in order as h3 headings', () => {
      const titles = Array.from(
        fixture.nativeElement.querySelectorAll('h3.meal-title')
      ).map((h) => (h as HTMLElement).textContent!.trim());
      expect(titles).toEqual(['Breakfast', 'Lunch', 'Dinner', 'Snacks']);
    });

    it('gives each meal its own icon tile', () => {
      const tiles = Array.from(
        fixture.nativeElement.querySelectorAll('.meal-icon')
      ) as HTMLElement[];
      expect(tiles.map((t) => t.dataset['meal'])).toEqual([
        'breakfast',
        'lunch',
        'dinner',
        'snacks',
      ]);
      expect(tiles.every((t) => t.getAttribute('aria-hidden') === 'true')).toBeTrue();
    });

    it('shows the same empty text in each empty meal', () => {
      const empties = Array.from(
        fixture.nativeElement.querySelectorAll('.empty-state')
      ) as HTMLElement[];
      expect(empties.map((e) => e.textContent!.trim())).toEqual([
        'No foods added yet',
        'No foods added yet',
        'No foods added yet',
        'No foods added yet',
      ]);
    });

    it('tells screen readers which meal each Add Food belongs to', () => {
      const buttons = Array.from(
        fixture.nativeElement.querySelectorAll('.add-button')
      ) as HTMLButtonElement[];
      const meals = buttons.map((b) => {
        const id = b.getAttribute('aria-describedby')!;
        return fixture.nativeElement.querySelector('#' + id).textContent.trim();
      });
      expect(meals).toEqual(['Breakfast', 'Lunch', 'Dinner', 'Snacks']);
    });

    it('opens the calculator for the meal whose Add Food was clicked', () => {
      const buttons = Array.from(
        fixture.nativeElement.querySelectorAll('.add-button')
      ) as HTMLButtonElement[];
      expect(buttons.map((b) => b.textContent!.trim())).toEqual([
        'Add Food',
        'Add Food',
        'Add Food',
        'Add Food',
      ]);
      buttons[2].click();
      expect(component.selectedMealType).toBe('dinner');
    });
  });

  describe('Add Food dialog', () => {
    beforeEach(() => {
      component.isLoading = false;
      fixture.detectChanges();
      component.openCalculator('lunch');
      fixture.detectChanges();
    });

    it('is a modal dialog named by its visible title', () => {
      const dialog = fixture.nativeElement.querySelector(
        '.dialog-content'
      ) as HTMLElement;
      expect(dialog.getAttribute('role')).toBe('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      const title = fixture.nativeElement.querySelector(
        '#' + dialog.getAttribute('aria-labelledby')
      ) as HTMLElement;
      expect(title.textContent!.trim()).toBe('Add to Lunch');
    });

    it('has a 44px close button labelled "Close"', () => {
      const close = fixture.nativeElement.querySelector(
        '.dialog-close'
      ) as HTMLButtonElement;
      expect(close.getAttribute('aria-label')).toBe('Close');
    });
  });

  describe('logged recipes', () => {
    const spinach = {
      foodName: 'Spinach',
      oxalatePerServing: 10,
      solubleOxalatePerServing: 4,
      servingSize: '1 cup',
      numberOfServings: 1,
    };

    beforeEach(() => {
      component.isLoading = false;
      component.dinnerItems = [spinach, recipeEntry(), { ...recipeEntry({ recipeId: 'gone', recipeName: 'Old stew' }), entryId: 'e2' }];
      component.existingRecipeIds = new Set(['r1']);
      fixture.detectChanges();
    });

    it('shows recipe rows next to food rows; food rows are unchanged', () => {
      const rows = [...fixture.nativeElement.querySelectorAll('.food-row')] as HTMLElement[];
      expect(rows.length).toBe(3);
      expect(rows[0].querySelector('.food-name-btn')!.textContent).toContain('Spinach');
      expect(rows[1].querySelector('app-recipe-entry')).not.toBeNull();
    });

    it('links existing recipes and marks deleted ones', () => {
      const entries = [...fixture.nativeElement.querySelectorAll('app-recipe-entry')] as HTMLElement[];
      expect(entries[0].querySelector('a')!.getAttribute('href')).toBe('/recipes/r1');
      expect(entries[1].querySelector('a')).toBeNull();
      expect(entries[1].textContent).toContain('Recipe deleted');
    });

    it('the meal total adds the recipe snapshots', () => {
      const total = fixture.nativeElement.querySelectorAll('.total-row .oxalate-col')[0] as HTMLElement;
      expect(total.textContent!.replace(/\s+/g, ' ').trim()).toBe('21.20 mg');
    });

    it('a recipe row can be deleted with the existing delete button', () => {
      const del = spyOn(component, 'deleteFood');
      const buttons = fixture.nativeElement.querySelectorAll('.food-row .delete-btn');
      expect(buttons[1].getAttribute('aria-label')).toBe('Delete Lemon herb chicken');
      buttons[1].click();
      expect(del).toHaveBeenCalledWith('dinner', 1);
    });
  });

  describe('opening on a date (View day)', () => {
    it('reads yyyy-mm-dd as that local day, and ignores anything else', () => {
      const d = dayFromParam('2026-11-19')!;
      expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 10, 19, 0]);
      expect(dayFromParam(null)).toBeNull();
      expect(dayFromParam('2026-02-30')).toBeNull();
      expect(dayFromParam('tomorrow')).toBeNull();
    });
  });
});
