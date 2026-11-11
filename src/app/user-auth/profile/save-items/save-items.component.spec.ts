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
});
