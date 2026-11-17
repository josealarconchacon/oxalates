import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { OxalateService } from 'src/app/landing-page/dialog-service/service/oxalate.service';
import { RecipeIngredient } from '../../../model/recipe';
import { food } from '../../../engine/testing/fixtures';
import { IngredientSearchComponent, SEARCH_DEBOUNCE_MS } from './ingredient-search.component';

const zucchini = food({ id: '7', item: 'Zucchini, raw', category: 'Vegetables', calc_level: 'Low', serving_size: '1/2 cup', serving_g: '60.00', calc_oxalate_per_serving: '1.30', total_oxalate_mg_per_100g: '2.17' });
const zucchiniCooked = food({ id: '8', item: 'Zucchini, cooked', category: 'Vegetables', calc_level: 'Very Low', serving_size: null, serving_g: null, total_oxalate_mg_per_100g: '0.60' });

describe('IngredientSearchComponent', () => {
  let fixture: ComponentFixture<IngredientSearchComponent>;
  let search: jasmine.Spy;
  let added: RecipeIngredient[];
  const el = () => fixture.nativeElement as HTMLElement;
  const input = () => el().querySelector<HTMLInputElement>('[role="combobox"]')!;
  const key = (target: HTMLElement, k: string) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };

  function typeQuery(q: string) {
    input().value = q;
    input().dispatchEvent(new Event('input'));
    tick(SEARCH_DEBOUNCE_MS);
    fixture.detectChanges();
  }

  beforeEach(() => {
    search = jasmine.createSpy('searchOxalateData').and.returnValue(of([zucchini, zucchiniCooked]));
    TestBed.configureTestingModule({
      imports: [IngredientSearchComponent],
      providers: [{ provide: OxalateService, useValue: { searchOxalateData: search } }],
    });
    fixture = TestBed.createComponent(IngredientSearchComponent);
    added = [];
    fixture.componentInstance.added.subscribe((i) => added.push(i));
    fixture.detectChanges();
  });

  it('is a labelled combobox that waits 250 ms and 2 letters before searching', fakeAsync(() => {
    expect(input().getAttribute('aria-label')).toBe('Search foods');
    typeQuery('z');
    expect(search).not.toHaveBeenCalled();
    input().value = 'zu';
    input().dispatchEvent(new Event('input'));
    tick(SEARCH_DEBOUNCE_MS - 1);
    expect(search).not.toHaveBeenCalled();
    tick(1);
    expect(search).toHaveBeenCalledWith('zu');
  }));

  it('lists results with category, mg per measure and the food level', fakeAsync(() => {
    typeQuery('zucc');
    const options = el().querySelectorAll('[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Zucchini, raw');
    expect(options[0].textContent).toContain('Vegetables · 1.3 mg per 1/2 cup');
    expect(options[0].textContent).toContain('Low');
    expect(options[1].textContent).toContain('0.6 mg per 100 g');
    expect(input().getAttribute('aria-expanded')).toBe('true');
  }));

  it('↓/↑ move the active option, Enter picks it', fakeAsync(() => {
    typeQuery('zucc');
    expect(input().getAttribute('aria-activedescendant')).toMatch(/-0$/);
    key(input(), 'ArrowDown');
    expect(input().getAttribute('aria-activedescendant')).toMatch(/-1$/);
    key(input(), 'ArrowDown'); // wraps
    expect(input().getAttribute('aria-activedescendant')).toMatch(/-0$/);
    key(input(), 'Enter');
    tick();
    expect(el().querySelector('.picked-food')!.textContent).toContain('Zucchini, raw');
  }));

  it('picking starts at one household serving (or 100 g), then Add emits and resets', fakeAsync(() => {
    typeQuery('zucc');
    (el().querySelectorAll('[role="option"]')[0] as HTMLElement).click();
    fixture.detectChanges();
    tick();
    expect(el().querySelector('.draft-mg')!.textContent).toBe('1.3 mg');
    el().querySelector<HTMLButtonElement>('.add')!.click();
    fixture.detectChanges();
    tick();
    expect(added.length).toBe(1);
    expect(added[0]).toEqual(
      jasmine.objectContaining({ source: 'database', foodId: '7', name: 'Zucchini, raw', inputUnit: 'serving', inputAmount: 1, grams: 60, servingLabel: '1/2 cup' })
    );
    expect(input().value).toBe('');
    expect(el().textContent).toContain('Added Zucchini, raw.');

    typeQuery('zucc');
    (el().querySelectorAll('[role="option"]')[1] as HTMLElement).click();
    fixture.detectChanges();
    tick();
    el().querySelector<HTMLButtonElement>('.add')!.click();
    tick();
    expect(added[1]).toEqual(jasmine.objectContaining({ foodId: '8', inputUnit: 'g', inputAmount: 100, grams: 100 }));
    expect(added[1].id).not.toBe(added[0].id);
  }));

  it('Enter in the amount adds; Esc closes', fakeAsync(() => {
    const closed = jasmine.createSpy('closed');
    fixture.componentInstance.closed.subscribe(closed);
    typeQuery('zucc');
    key(input(), 'Enter');
    tick();
    key(el().querySelector<HTMLInputElement>('app-amount-editor input')!, 'Enter');
    tick();
    expect(added.length).toBe(1);
    key(input(), 'Escape');
    expect(closed).toHaveBeenCalled();
  }));

  it('says when nothing matches', fakeAsync(() => {
    search.and.returnValue(of([]));
    typeQuery('xyzzy');
    expect(el().querySelector('.status')!.textContent).toContain('We couldn’t find “xyzzy”.'.replace('’', "'"));
  }));
});
