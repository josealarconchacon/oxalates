import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { provideRouter } from '@angular/router';
import { OxalateComponent } from './oxalate.component';
import { OxalateService } from '../service/oxalate.service';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';
import { FilterComponent } from './filter/filter.component';
import { ViewMoreComponent } from './view-more/view-more.component';
import { SearchInputComponent } from './search-input/search-input.component';
import { AlertComponent } from './shared/alert/alert.component';
import { ClickableDirective } from 'src/app/shared/directives/clickable.directive';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';

describe('OxalateComponent', () => {
  let component: OxalateComponent;
  let fixture: ComponentFixture<OxalateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule, // Add FormsModule here to provide ngModel
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule,
        // The page's own building blocks, so the template is checked for real
        SearchInputComponent,
        AlertComponent,
        ClickableDirective,
        IconComponent,
      ],
      declarations: [OxalateComponent, FilterComponent, ViewMoreComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OxalateService,
        provideRouter([]),
      ],
    });
    fixture = TestBed.createComponent(OxalateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('withUnit', () => {
    it('adds mg after numbers, including 0', () => {
      expect(component.withUnit('0.11')).toBe('0.11 mg');
      expect(component.withUnit('0')).toBe('0 mg');
      expect(component.withUnit(0.46)).toBe('0.46 mg');
    });

    it('shows words as they are, without mg', () => {
      expect(component.withUnit('uncalculated')).toBe('uncalculated');
      expect(component.withUnit('n/a')).toBe('n/a');
    });

    it('shows nothing for a missing value', () => {
      expect(component.withUnit(null)).toBe('');
      expect(component.withUnit('')).toBe('');
    });
  });

  describe('result rows', () => {
    const food = {
      category: 'Baking Items',
      item: 'Gelatin',
      serving_size: '1 tsp',
      calc_level: 'Very Low',
      calc_oxalate_per_serving: '0',
      calc_soluble_mg_oxalate_per_serving: 'uncalculated',
    } as any;
    const el = () => fixture.nativeElement as HTMLElement;
    const text = (e: Element | null) =>
      (e?.textContent ?? '').replace(/\s+/g, ' ').trim();

    beforeEach(() => {
      spyOn(component, 'showSearchPrompt').and.returnValue(true);
      component.isLoading = false;
      component.browseItems = [food];
      fixture.detectChanges();
    });

    it('is a list of rows inside one card', () => {
      expect(el().querySelectorAll('ul.results-list > li.result-item').length).toBe(1);
    });

    it('shows each number once, in the right column', () => {
      const row = el().querySelector('.result-item')!;
      expect(text(row.querySelector('.result-right'))).toBe(
        '0 mg per serving Soluble: uncalculated'
      );
      expect(text(row).match(/per serving/g)!.length).toBe(1);
      expect(text(row).match(/Soluble/g)!.length).toBe(1);
    });

    it('keeps category, name, serving size and level', () => {
      const row = el().querySelector('.result-item')!;
      expect(text(row.querySelector('.result-category-breadcrumb'))).toBe('Baking Items');
      expect(text(row.querySelector('h2'))).toBe('Gelatin');
      expect(text(row.querySelector('.serving-chip'))).toBe('1 tsp');
      expect(text(row.querySelector('.level-badge'))).toBe('Very Low');
    });

    it('opens the same details popup from the name button', () => {
      const spy = spyOn(component, 'viewMore');
      const button = el().querySelector('.result-button') as HTMLButtonElement;
      expect(button.getAttribute('type')).toBe('button');
      expect(text(button)).toBe('Gelatin');
      button.click();
      expect(spy).toHaveBeenCalledWith(food, jasmine.any(Event));
    });
  });

  describe('pagination', () => {
    const el = () => fixture.nativeElement as HTMLElement;
    const setPage = (current: number, pages: (number | string)[]) => {
      spyOnProperty(component, 'currentPage').and.returnValue(current);
      spyOnProperty(component, 'totalPages').and.returnValue(300);
      spyOn(component, 'getPages').and.returnValue(pages);
      component.browseItems = [{ item: 'Salt' } as any];
      component.hasSearched = false;
      fixture.detectChanges();
    };
    const navButtons = () =>
      Array.from(el().querySelectorAll('.pagination-nav')) as HTMLButtonElement[];

    it('is a labelled nav with the same words', () => {
      setPage(1, [1, 2, 3, 4, 5, '...', 300]);
      const nav = el().querySelector('nav.pagination')!;
      expect(nav.getAttribute('aria-label')).toBe('Pagination');
      expect(navButtons().map((b) => b.textContent!.trim())).toEqual([
        'First',
        'Previous',
        'Next',
        'Last',
      ]);
    });

    it('marks the current page and dims First/Previous on page 1', () => {
      setPage(1, [1, 2, 3, 4, 5, '...', 300]);
      const current = el().querySelector('[aria-current="page"]')!;
      expect(current.textContent!.trim()).toBe('1');
      const [first, prev, next, last] = navButtons();
      expect([first.disabled, prev.disabled]).toEqual([true, true]);
      expect(first.getAttribute('aria-disabled')).toBe('true');
      expect([next.disabled, last.disabled]).toEqual([false, false]);
    });

    it('shows "…" as text, not as a button', () => {
      setPage(1, [1, 2, 3, 4, 5, '...', 300]);
      const pageButtons = Array.from(el().querySelectorAll('.pagination-page')).map(
        (b) => b.textContent!.trim()
      );
      expect(pageButtons).toEqual(['1', '2', '3', '4', '5', '300']);
      expect(el().querySelector('.pagination-ellipsis')!.textContent).toBe('…');
    });

    it('goes to the clicked page through the same changePage', () => {
      setPage(1, [1, 2, 3]);
      const spy = spyOn(component, 'changePage');
      (el().querySelectorAll('.pagination-page')[2] as HTMLButtonElement).click();
      navButtons()[3].click();
      expect(spy.calls.allArgs()).toEqual([[3], [300]]);
    });

    it('dims Next/Last on the last page', () => {
      setPage(300, [1, '...', 296, 297, 298, 299, 300]);
      const [first, , next, last] = navButtons();
      expect([next.disabled, last.disabled, first.disabled]).toEqual([true, true, false]);
    });
  });

  describe('isFarPage (compact phone pager)', () => {
    const far = (current: number, pages: number[]) => {
      spyOnProperty(component, 'currentPage').and.returnValue(current);
      spyOnProperty(component, 'totalPages').and.returnValue(300);
      return pages.filter((p) => !component.isFarPage(p));
    };

    it('keeps 1 2 3 and the last page on page 1', () => {
      expect(far(1, [1, 2, 3, 4, 5, 300])).toEqual([1, 2, 3, 300]);
    });

    it('keeps the neighbours of a middle page, plus first and last', () => {
      expect(far(5, [1, 3, 4, 5, 6, 7, 300])).toEqual([1, 4, 5, 6, 300]);
    });

    it('keeps the last three pages at the end', () => {
      expect(far(300, [1, 296, 297, 298, 299, 300])).toEqual([1, 298, 299, 300]);
    });

    it('never hides "…"', () => {
      spyOnProperty(component, 'currentPage').and.returnValue(5);
      expect(component.isFarPage('...')).toBeFalse();
    });
  });
});

