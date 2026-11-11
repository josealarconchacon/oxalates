import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SaveItemsComponent } from './save-items.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { RouterLink, provideRouter } from '@angular/router';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';

// Mock db configuration
const firebaseConfig = {
  apiKey: 'mock-api-key',
  authDomain: 'mock-auth-domain',
  projectId: 'mock-project-id',
  storageBucket: 'mock-storage-bucket',
  messagingSenderId: 'mock-messaging-sender-id',
  appId: 'mock-app-id',
};

// Mock AngularFirestore
const angularFirestoreMock = {
  collection: jasmine.createSpy('collection').and.returnValue({
    valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of([])),
    doc: jasmine.createSpy('doc').and.returnValue({
      set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
    }),
  }),
};

describe('SaveItemsComponent', () => {
  let component: SaveItemsComponent;
  let fixture: ComponentFixture<SaveItemsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaveItemsComponent],
      imports: [
        AngularFireModule.initializeApp(firebaseConfig),
        IconComponent,
        RouterLink,
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideHttpClientTesting(),
        { provide: AngularFirestore, useValue: angularFirestoreMock },
      ],
    });
    fixture = TestBed.createComponent(SaveItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('saved foods list', () => {
    const rows = () =>
      Array.from(
        fixture.nativeElement.querySelectorAll('.list-item')
      ) as HTMLButtonElement[];

    beforeEach(() => {
      component.savedOxalates$ = of([
        { id: 'a', item: 'Baking Powder', total_oxalate_mg_per_100g: '0.00' },
        { id: 'b', item: 'Pero Coffee Substitute' },
      ] as any);
      fixture.detectChanges();
    });

    it('marks only the chosen food as pressed', () => {
      expect(rows().map((r) => r.getAttribute('aria-pressed'))).toEqual([
        'false',
        'false',
      ]);

      rows()[1].click();
      fixture.detectChanges();

      expect(rows().map((r) => r.getAttribute('aria-pressed'))).toEqual([
        'false',
        'true',
      ]);
      expect(rows()[1].classList).toContain('selected');
    });

    it('keeps the food name and subtitle text as they are', () => {
      expect(rows()[0].querySelector('.item-title')?.textContent?.trim()).toBe(
        'Baking Powder'
      );
      expect(
        rows()[0].querySelector('.item-subtitle')?.textContent?.trim()
      ).toBe(component.getSubtitle({ total_oxalate_mg_per_100g: '0.00' } as any));
    });
  });

  describe('detail header', () => {
    beforeEach(() => {
      component.savedOxalates$ = of([
        {
          id: 'a',
          item: 'Baking Powder',
          calc_level: 'Very Low',
          category: 'Baking Items',
        },
      ] as any);
      component.expandedCardId = 'a';
      fixture.detectChanges();
    });

    const detail = () =>
      fixture.nativeElement.querySelector('.detail-view') as HTMLElement;

    it('shows the food name and its Calc Level as a badge', () => {
      expect(detail().querySelector('.item-name')?.textContent?.trim()).toBe(
        'Baking Powder'
      );
      expect(
        detail().querySelector('.calc-level-label')?.textContent?.trim()
      ).toBe('Calc Level');
      const badge = detail().querySelector('.level-badge')!;
      expect(badge.textContent?.trim()).toBe('Very Low');
      expect(badge.getAttribute('data-tone')).toBe('very-low');
    });

    it('does not repeat Calc Level in the field list', () => {
      const keys = Array.from(detail().querySelectorAll('.detail-key')).map(
        (k) => k.textContent?.trim()
      );
      expect(keys).not.toContain('Calc Level');
      expect(keys).toContain('Category');
    });

    it('keeps the delete button label', () => {
      expect(
        detail().querySelector('.delete-button')?.getAttribute('aria-label')
      ).toBe('Delete Baking Powder');
    });
  });

  describe('levelTone', () => {
    it('groups levels like the search page does', () => {
      expect(component.levelTone('Extremely High')).toBe('high');
      expect(component.levelTone('Very High')).toBe('high');
      expect(component.levelTone('High')).toBe('high');
      expect(component.levelTone('Medium')).toBe('medium');
      expect(component.levelTone('Low')).toBe('low');
      expect(component.levelTone('Very Low')).toBe('very-low');
      expect(component.levelTone('very low')).toBe('very-low');
    });

    it('gives anything else a neutral badge', () => {
      expect(component.levelTone('50.90')).toBe('neutral');
    });
  });

  describe('stat tiles and field list', () => {
    const food = {
      id: 'x',
      soluble_oxalate: '0',
      serving_g: '1.50',
      total_oxalate_mg_per_100g: '48.80',
      item: 'Pero Coffee Substitute',
      calc_level: 'Very Low',
      level: '1',
      calc_soluble_mg_oxalate_per_serving: '0.73',
      category: 'Beverages',
      zz_extra: 'kept',
    };

    it('puts the two mg totals in tiles', () => {
      expect(component.statTiles(food).map((t) => [t.label, t.value])).toEqual([
        ['Total Oxalate Mg Per 100g', '48.80'],
        ['Calc Soluble Mg Oxalate Per Serving', '0.73'],
      ]);
    });

    it('skips a tile the food has no value for', () => {
      const { total_oxalate_mg_per_100g, ...rest } = food;
      expect(component.statTiles(rest).map((t) => t.key)).toEqual([
        'calc_soluble_mg_oxalate_per_serving',
      ]);
    });

    it('lists every other field in a fixed order, unknown ones last', () => {
      expect(component.detailFields(food).map((f) => f.key)).toEqual([
        'item',
        'category',
        'level',
        'soluble_oxalate',
        'serving_g',
        'zz_extra',
      ]);
    });

    it('keeps the values exactly as saved', () => {
      const values = component.detailFields(food).map((f) => f.value);
      expect(values).toEqual([
        'Pero Coffee Substitute',
        'Beverages',
        '1',
        '0',
        '1.50',
        'kept',
      ]);
    });
  });

  describe('phone accordion', () => {
    const rows = () =>
      Array.from(
        fixture.nativeElement.querySelectorAll('.list-item')
      ) as HTMLButtonElement[];

    beforeEach(() => {
      (component as any).isPhone = signal(true);
      component.savedOxalates$ = of([
        { id: 'a', item: 'Baking Powder', category: 'Baking Items' },
        { id: 'b', item: 'Pero Coffee Substitute', category: 'Beverages' },
      ] as any);
      fixture.detectChanges();
    });

    it('uses aria-expanded instead of aria-pressed', () => {
      expect(rows()[0].getAttribute('aria-expanded')).toBe('false');
      expect(rows()[0].hasAttribute('aria-pressed')).toBeFalse();
    });

    it('opens the details inside the tapped card and points to them', () => {
      rows()[1].click();
      fixture.detectChanges();

      const button = rows()[1];
      expect(button.getAttribute('aria-expanded')).toBe('true');
      const panel = fixture.nativeElement.querySelector(
        '#' + button.getAttribute('aria-controls')
      ) as HTMLElement;
      expect(panel).toBeTruthy();
      expect(button.parentElement!.contains(panel)).toBeTrue();
      expect(panel.textContent).toContain('Beverages');
    });

    it('closes the card when tapped again', () => {
      rows()[0].click();
      fixture.detectChanges();
      rows()[0].click();
      fixture.detectChanges();
      expect(rows()[0].getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('selectFirstOnWideScreens', () => {
    const list = [{ id: 'a' }, { id: 'b' }];

    it('opens the first food on iPad and desktop', () => {
      (component as any).isPhone = signal(false);
      component.expandedCardId = null;
      component.selectFirstOnWideScreens(list);
      expect(component.expandedCardId as string | null).toBe('a');
    });

    it('keeps the food the user already picked', () => {
      (component as any).isPhone = signal(false);
      component.expandedCardId = 'b';
      component.selectFirstOnWideScreens(list);
      expect(component.expandedCardId).toBe('b');
    });

    it('leaves every card closed on phones', () => {
      (component as any).isPhone = signal(true);
      component.expandedCardId = null;
      component.selectFirstOnWideScreens(list);
      expect(component.expandedCardId).toBeNull();
    });

    it('does nothing when there are no saved foods', () => {
      (component as any).isPhone = signal(false);
      component.expandedCardId = null;
      component.selectFirstOnWideScreens([]);
      expect(component.expandedCardId).toBeNull();
    });
  });

  describe('empty state', () => {
    beforeEach(() => {
      component.savedOxalates$ = of([]);
      fixture.detectChanges();
    });

    it('explains how to save a food', () => {
      const empty = fixture.nativeElement.querySelector('.no-items');
      expect(empty.querySelector('h3').textContent.trim()).toBe(
        'No saved foods yet'
      );
      expect(empty.textContent).toContain('Add to Favorite');
    });

    it('links to the food search', () => {
      const link = fixture.nativeElement.querySelector(
        '.no-items-action'
      ) as HTMLAnchorElement;
      expect(link.textContent?.trim()).toBe('Search for foods');
      expect(link.getAttribute('href')).toBe('/oxalate');
    });
  });
});

