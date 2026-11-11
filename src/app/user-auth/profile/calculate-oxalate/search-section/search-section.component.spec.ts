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
});

