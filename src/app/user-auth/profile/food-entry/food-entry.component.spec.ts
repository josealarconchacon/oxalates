import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodEntryComponent } from './food-entry.component';
import { AngularFireModule } from '@angular/fire/compat';
import {
  AngularFirestoreModule,
  AngularFirestore,
} from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';

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
});

