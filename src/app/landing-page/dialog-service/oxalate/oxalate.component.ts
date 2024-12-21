import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { OxalateService } from '../service/oxalate.service';
import { FilterService } from './service/filter.service';
import { Filter } from './filter/model/filter';
import { Router } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
  take,
} from 'rxjs/operators';
import { combineLatest, Subject, Subscription } from 'rxjs';
import { PaginationService } from './service/pagination.service';
import { CategoryService } from './service/category.service';

@Component({
  selector: 'app-oxalate',
  templateUrl: './oxalate.component.html',
  styleUrls: ['./oxalate.component.css'],
})
export class OxalateComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private searchSubject: Subject<string> = new Subject<string>();

  oxalates: Oxalate[] = [];
  originalOxalates: Oxalate[] = [];
  displayedOxalates: Oxalate[] = [];

  searchQuery: string = '';
  alertMessage: string = '';
  showAlert: boolean = false;
  isLoading: boolean = false;
  isFilterApplied: boolean = false;
  selectedOxalate: Oxalate | undefined;
  viewMode: 'list' | 'grid' = 'list';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    public filterService: FilterService,
    private oxalateService: OxalateService,
    private categoryService: CategoryService,
    private paginationService: PaginationService
  ) {}

  ngOnInit(): void {
    this.initializeViewMode();
    this.setupSearchSubscription();
    this.initializeWithRouteParams();
  }

  private initializeWithRouteParams(): void {
    // Get initial data and combine with route parameters
    this.subscriptions.push(
      combineLatest([
        this.oxalateService.getOxalateData(),
        this.categoryService.currentCategory$.pipe(take(1)),
      ]).subscribe({
        next: ([data, category]) => {
          console.log('Initial data fetched:', data);
          console.log('Initial category:', category);

          this.oxalates = data;
          this.originalOxalates = [...data];

          // If there's a category from the route, apply it
          if (category) {
            console.log('Applying initial category filter:', category);
            this.filterService.setCategory(category);
            this.isFilterApplied = true;
            this.applyFilters({
              category: category,
              calc_level: '',
            });
          } else {
            this.updateDisplayedOxalates();
          }
        },
        error: (error) => {
          console.error('Error initializing component:', error);
        },
      })
    );
    this.categoryOnChange();
    this.filterOnChange();
  }

  // Handle subsequent category changes
  categoryOnChange() {
    this.subscriptions.push(
      this.categoryService.currentCategory$.subscribe({
        next: (category) => {
          console.log('Category changed:', category);
          if (category) {
            this.filterService.setCategory(category);
            this.isFilterApplied = true;
            this.applyFilters({
              category: category,
              calc_level: '',
            });
            // Reset pagination when category changes
            this.paginationService.changePage(1, this.oxalates.length);
          }
        },
        error: (error) => {
          console.error('Error handling category change:', error);
        },
      })
    );
  }

  // Handle filter changes
  filterOnChange() {
    this.subscriptions.push(
      this.filterService.currentFilter$.subscribe({
        next: (filter: Filter) => {
          console.log('Filter changed:', filter);
          if (filter && (filter.category || filter.calc_level)) {
            this.applyFilters(filter);
          }
        },
        error: (error) => {
          console.error('Error handling filter change:', error);
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private initializeViewMode(): void {
    const savedViewMode = localStorage.getItem('viewMode');
    this.viewMode = (savedViewMode as 'list' | 'grid') || 'list';
  }

  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          this.isLoading = true;
          return this.oxalateService.searchOxalateData(query).pipe(
            finalize(() => {
              this.isLoading = false;
            })
          );
        })
      )
      .subscribe(
        (data) => {
          console.log('Search results:', data);
          if (data.length === 0) {
            this.showAlert = true;
            this.alertMessage =
              'No results found. Try different keywords or check your spelling.';
            this.resetData();
          } else {
            this.oxalates = this.sortBySearchTerm(data, this.searchQuery);
            this.updateDisplayedOxalates();
            this.showAlert = false;
          }
        },
        (error) => {
          console.error('Error handling search change:', error);
        }
      );
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
    localStorage.setItem('viewMode', this.viewMode);
  }

  getViewModeClass(): string {
    return `${this.viewMode}-view`;
  }

  updateData() {
    this.cdr.detectChanges();
  }

  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  applyFilters(filter: Filter): void {
    console.log('Applying filters:', filter);
    if (this.originalOxalates.length === 0) {
      console.warn('No oxalates data to filter.');
      return;
    }

    let filteredOxalates = [...this.originalOxalates];

    if (filter.category) {
      console.log('Filtering by category:', filter.category);
      filteredOxalates = filteredOxalates.filter(
        (oxalate) => oxalate.category === filter.category
      );
      console.log('Results after category filter:', filteredOxalates.length);
    }

    if (filter.calc_level) {
      filteredOxalates = filteredOxalates.filter(
        (oxalate) => oxalate.calc_level === filter.calc_level
      );
      console.log('Results after calc_level filter:', filteredOxalates.length);
    }

    if (this.searchQuery) {
      filteredOxalates = this.applySearch(filteredOxalates, this.searchQuery);
      console.log('Results after search:', filteredOxalates.length);
    }

    this.oxalates = filteredOxalates;
    this.isFilterApplied = true;
    this.updateDisplayedOxalates();
    this.cdr.detectChanges();
  }

  private applySearch(items: Oxalate[], query: string): Oxalate[] {
    const searchLower = query.toLowerCase();
    return items.filter((oxalate) => {
      return (
        (oxalate.item && oxalate.item.toLowerCase().includes(searchLower)) ||
        (oxalate.category &&
          oxalate.category.toLowerCase().includes(searchLower)) ||
        (oxalate.level && oxalate.level.toString().includes(searchLower)) ||
        (oxalate.calc_level &&
          oxalate.calc_level.toLowerCase().includes(searchLower))
      );
    });
  }

  clearFilters(): void {
    this.categoryService.clearAll();
    this.filterService.clearAll();
    this.searchQuery = '';
    this.isFilterApplied = false;
    this.oxalates = [...this.originalOxalates];

    this.updateDisplayedOxalates();
  }

  resetData(): void {
    this.oxalates = [...this.originalOxalates];
    this.updateDisplayedOxalates();
  }

  updateDisplayedOxalates(): void {
    console.log('Updating displayed oxalates, total:', this.oxalates.length);
    this.displayedOxalates = this.paginationService.updateDisplayedItems(
      this.oxalates
    );
    console.log('New displayed oxalates:', this.displayedOxalates.length);
  }

  getPages(): (number | string)[] {
    return this.paginationService.getPages(this.oxalates.length);
  }

  changePage(page: number | string): void {
    this.paginationService.changePage(page, this.oxalates.length);
    this.updateDisplayedOxalates();
  }

  viewMore(oxalate: Oxalate): void {
    console.log('Selected Oxalate:', oxalate);
    this.selectedOxalate = oxalate;
    document.body.style.overflow = 'hidden';
  }

  closeDetail(): void {
    this.selectedOxalate = undefined;
    document.body.style.overflow = '';
  }

  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  get currentPage(): number {
    return this.paginationService.currentPage;
  }

  get totalPages(): number {
    return this.paginationService.totalPages;
  }

  sortBySearchTerm(data: Oxalate[], searchTerm: string): Oxalate[] {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return data.sort((a, b) => {
      const aItem = a.item ? a.item.toLowerCase() : '';
      const bItem = b.item ? b.item.toLowerCase() : '';

      const aStartsWith = aItem.startsWith(lowerCaseSearchTerm);
      const bStartsWith = bItem.startsWith(lowerCaseSearchTerm);

      if (aStartsWith && !bStartsWith) {
        return -1;
      } else if (!aStartsWith && bStartsWith) {
        return 1;
      } else {
        return aItem.localeCompare(bItem, undefined, { sensitivity: 'base' });
      }
    });
  }
}
