import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewMoreComponent } from './view-more.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';

describe('ViewMoreComponent', () => {
  let component: ViewMoreComponent;
  let fixture: ComponentFixture<ViewMoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewMoreComponent],
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        IconComponent,
      ],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    fixture = TestBed.createComponent(ViewMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('details layout', () => {
    const food = {
      item: 'Yuca root (Cassava), peeled, cubed, and boiled 30 min',
      category: 'Vegetables',
      calc_level: 'Medium',
      level: '3',
      total_oxalate_mg_per_100g: '6.10',
      total_soluble_oxalate_mg_per_100g: '5.10',
      serving_size: '1/2 cup',
      serving_g: '128.00',
      calc_oxalate_per_serving: '7.81',
      calc_soluble_mg_oxalate_per_serving: '6.53',
      soluble_oxalate: '84',
    } as any;
    const el = () => fixture.nativeElement as HTMLElement;
    const text = (e: Element | null) =>
      (e?.textContent ?? '').replace(/\s+/g, ' ').trim();

    beforeEach(() => {
      component.oxalateData = food;
      fixture.detectChanges();
    });

    it('shows category, name and the level as a pill in the header', () => {
      expect(text(el().querySelector('.item-category'))).toBe('Vegetables');
      expect(text(el().querySelector('#oxalate-title'))).toBe(food.item);
      expect(text(el().querySelector('.level-label'))).toBe('Calculated Level');
      const badge = el().querySelector('.level-badge')!;
      expect(text(badge)).toBe('Medium');
      // The old code read "Medium" as a number and colored it as high (red).
      expect(badge.getAttribute('data-tone')).toBe('medium');
    });

    it('puts the per-serving numbers in tiles, with the same labels and units', () => {
      const tiles = Array.from(el().querySelectorAll('.stat-tile')).map((t) => [
        text(t.querySelector('dt')),
        text(t.querySelector('dd')),
      ]);
      expect(tiles).toEqual([
        ['Oxalate Per Serving', '7.81 (mg)'],
        ['Soluble Oxalate Per Serving', '6.53 (mg)'],
      ]);
    });

    it('lists every other field once, in the usual order', () => {
      const rows = Array.from(el().querySelectorAll('.detail-row')).map((r) => [
        text(r.querySelector('dt')),
        text(r.querySelector('dd')),
      ]);
      expect(rows).toEqual([
        ['Level', '3'],
        ['Total Oxalate', '6.10 (mg/100g)'],
        ['Total Soluble Oxalate', '5.10 (mg/100g)'],
        ['Serving Size', '1/2 cup'],
        ['Serving Grams', '128.00'],
        ['Soluble Oxalate', '84'],
      ]);
    });

    it('keeps Add to Favorite as one full-width button', () => {
      const save = el().querySelector('.save-button') as HTMLButtonElement;
      expect(text(save)).toBe('Add to Favorite');
      expect(save.getAttribute('type')).toBe('button');
    });
  });

  describe('levelTone', () => {
    it('groups word levels like the search page', () => {
      expect(component.levelTone('Very Low')).toBe('very-low');
      expect(component.levelTone('Low')).toBe('low');
      expect(component.levelTone('Medium')).toBe('medium');
      expect(component.levelTone('Extremely High')).toBe('high');
      expect(component.levelTone('uncalculated')).toBe('neutral');
    });
  });
});

