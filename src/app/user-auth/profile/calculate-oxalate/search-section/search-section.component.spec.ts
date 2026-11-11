import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSectionComponent } from './search-section.component';

describe('SearchSectionComponent', () => {
  let component: SearchSectionComponent;
  let fixture: ComponentFixture<SearchSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const el = () => fixture.nativeElement as HTMLElement;
  const input = () => el().querySelector('input') as HTMLInputElement;

  it('has a hidden label with the same name as before', () => {
    const label = el().querySelector('label[for="food-search"]')!;
    expect(label.textContent!.trim()).toBe('Search foods');
    expect(label.classList).toContain('sr-only');
    expect(input().placeholder).toBe('Search foods...');
  });

  it('shows Clear search only when there is text', async () => {
    expect(el().querySelector('.clear-button')).toBeNull();

    component.foodName = 'Baking Products, Baking Powder';
    component.ngOnChanges({ foodName: {} as any });
    fixture.detectChanges();
    await fixture.whenStable();

    const clear = el().querySelector('.clear-button') as HTMLButtonElement;
    expect(clear.getAttribute('aria-label')).toBe('Clear search');
    expect(input().value).toBe('Baking Products, Baking Powder');
  });

  it('empties the box, tells the form, and keeps focus in the box', async () => {
    const cleared = jasmine.createSpy('clear');
    component.clear.subscribe(cleared);
    component.query = 'baking';
    fixture.detectChanges();
    await fixture.whenStable();

    (el().querySelector('.clear-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(cleared).toHaveBeenCalled();
    expect(input().value).toBe('');
    expect(document.activeElement).toBe(input());
    expect(el().querySelector('.clear-button')).toBeNull();
  });

  describe('results list (combobox)', () => {
    const foods = [
      { name: 'Baking Powder', totalOxalate: 0.11, solubleOxalate: 0 },
      { name: 'Baking Soda', totalOxalate: 0, solubleOxalate: 0 },
      { name: 'Egg Replacer', totalOxalate: 0.58, solubleOxalate: 0.1 },
    ] as any[];
    const key = (k: string) => {
      const e = new KeyboardEvent('keydown', { key: k, cancelable: true, bubbles: true });
      input().dispatchEvent(e);
      fixture.detectChanges();
      return e;
    };
    const options = () =>
      Array.from(el().querySelectorAll('[role="option"]')) as HTMLElement[];

    beforeEach(() => {
      component.similarFoods = foods;
      component.showSuggestions = true;
      component.ngOnChanges({ similarFoods: {} as any });
      fixture.detectChanges();
    });

    it('announces the list from the search box', () => {
      expect(input().getAttribute('role')).toBe('combobox');
      expect(input().getAttribute('aria-expanded')).toBe('true');
      expect(input().getAttribute('aria-controls')).toBe('food-results');
      expect(el().querySelector('#food-results')!.getAttribute('role')).toBe('listbox');
      expect(options().length).toBe(3);
    });

    it('keeps the same row text', () => {
      const text = options()[0].textContent!.replace(/\s+/g, ' ').trim();
      expect(text).toBe(
        'Baking Powder Oxalate Per Serving: 0.11 mg Soluble Oxalate Per Serving: 0.00 mg'
      );
    });

    it('moves the highlight with the arrow keys, wrapping around', () => {
      key('ArrowDown');
      expect(input().getAttribute('aria-activedescendant')).toBe('food-result-0');
      key('ArrowDown');
      key('ArrowDown');
      key('ArrowDown');
      expect(input().getAttribute('aria-activedescendant')).toBe('food-result-0');
      key('ArrowUp');
      expect(input().getAttribute('aria-activedescendant')).toBe('food-result-2');
      expect(options()[2].getAttribute('aria-selected')).toBe('true');
    });

    it('picks the highlighted food with Enter', () => {
      const picked: any[] = [];
      component.selectFood.subscribe((f) => picked.push(f));
      key('ArrowDown');
      key('ArrowDown');
      const e = key('Enter');
      expect(picked).toEqual([foods[1]]);
      expect(e.defaultPrevented).toBeTrue();
    });

    it('closes only the list on Escape, so the dialog stays open', () => {
      const dismissed = jasmine.createSpy('dismiss');
      component.dismiss.subscribe(dismissed);
      const docListener = jasmine.createSpy('document escape');
      document.addEventListener('keydown', docListener);

      key('Escape');

      document.removeEventListener('keydown', docListener);
      expect(dismissed).toHaveBeenCalled();
      expect(docListener).not.toHaveBeenCalled();
    });

    it('still picks a food by clicking it', () => {
      const picked: any[] = [];
      component.selectFood.subscribe((f) => picked.push(f));
      options()[2].click();
      expect(picked).toEqual([foods[2]]);
    });
  });
});

