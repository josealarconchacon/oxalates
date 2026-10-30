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

    describe('at the compact (phone) width', () => {
      beforeEach(() => {
        component.isCompact = true;
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

    describe('at the wide (desktop) width', () => {
      beforeEach(() => {
        component.isCompact = false;
        fixture.detectChanges();
      });

      it('shows the name as plain text, because there is nothing to expand', () => {
        expect(el('button.food-name-btn')).toBeNull();
        expect(el('.food-name-static')!.textContent!.trim()).toBe('Almonds');
      });
    });
  });
});
