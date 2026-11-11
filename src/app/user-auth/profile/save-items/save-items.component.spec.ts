import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SaveItemsComponent } from './save-items.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { of } from 'rxjs';
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
      ],
      providers: [
        provideHttpClient(),
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
});
