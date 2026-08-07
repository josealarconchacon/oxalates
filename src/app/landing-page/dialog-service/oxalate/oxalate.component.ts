import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { OxalateService } from '../service/oxalate.service';
import { FilterService } from './service/filter.service';
import { Filter } from './filter/model/filter';
import { Router, ActivatedRoute } from '@angular/router';
import { ThemeService } from 'src/app/shared/services/theme.service';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
  take,
} from 'rxjs/operators';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { PaginationService } from './service/pagination.service';
import { CategoryService } from './service/category.service';

@Component({
  selector: 'app-oxalate',
  templateUrl: './oxalate.component.html',
  styleUrls: ['./oxalate.component.css'],
})
export class OxalateComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private searchSubject: Subject<{ query: string; immediate?: boolean }> =
    new Subject<{ query: string; immediate?: boolean }>();

  oxalates: Oxalate[] = [];
  originalOxalates: Oxalate[] = [];
  fullDatasetLength: number = 0;
  displayedOxalates: Oxalate[] = [];
  randomItems: Oxalate[] = [];
  isDarkTheme: boolean = false;

  searchQuery: string = '';
  hasSearched: boolean = false;
  alertMessage: string = '';
  showAlert: boolean = false;
  isLoading: boolean = false;
  errorState: boolean = false;
  isFilterApplied: boolean = false;
  selectedOxalate: Oxalate | undefined;
  viewMode: 'list' | 'grid' = 'list';
  private lastSearchQuery: string = '';
  private focusRestoreTarget: HTMLElement | null = null;

  @ViewChild('modalContainer') modalContainer?: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public filterService: FilterService,
    private oxalateService: OxalateService,
    private categoryService: CategoryService,
    private paginationService: PaginationService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.initializeViewMode();
    this.setupSearchSubscription();
    this.handleQueryParams();
    this.setupNavigationHandling();

    // Set up category and filter change subscriptions
    this.categoryOnChange();
    this.filterOnChange();

    // Subscribe to theme changes
    this.subscriptions.push(
      this.themeService.isDarkTheme$.subscribe((isDark) => {
        this.isDarkTheme = isDark;
        this.cdr.detectChanges();
      }),
    );

    this.loadRandomItems();
  }

  getPreviewBadgeClass(calcLevel: string): string {
    if (!calcLevel) return '';
    return 'level-' + calcLevel.toLowerCase().replace(/\s+/g, '-');
  }

  loadRandomItems(): void {
    const fullDataset = this.originalOxalates?.length
      ? this.originalOxalates
      : this.oxalates?.length
        ? this.oxalates
        : [];
    if (fullDataset.length === 0) {
      this.randomItems = [];
      return;
    }
    const pageSize = this.paginationService.itemsPerPage;
    const maxStart = Math.max(0, fullDataset.length - pageSize);
    const randomStart = maxStart === 0 ? 0 : Math.floor(Math.random() * (maxStart + 1));
    const landingPage = Math.floor(randomStart / pageSize) + 1;
    this.fullDatasetLength = fullDataset.length;
    this.paginationService.changePage(landingPage, fullDataset.length);
    this.randomItems = fullDataset.slice(
      (landingPage - 1) * pageSize,
      landingPage * pageSize
    );
  }

  private handleQueryParams(): void {
    this.subscriptions.push(
      this.route.queryParams.subscribe((params) => {
        console.log('Received query params:', params);

        // Get data first, then apply filters and search
        this.oxalateService.getOxalateData().subscribe((data) => {
          console.log('Data loaded, total items:', data.length);
          this.oxalates = data;
          this.originalOxalates = [...data];
          this.fullDatasetLength = this.originalOxalates.length;
          this.loadRandomItems();

          // Process parameters in sequence
          this.processQueryParams(params);

          // Additional check: if category was set in services but not in params, apply it
          const currentCategory = this.categoryService.currentCategory$.pipe(
            take(1),
          );
          currentCategory.subscribe((category) => {
            if (category && !params['category']) {
              console.log(
                'Category found in service but not in params, applying:',
                category,
              );
              this.applyFilters({
                category: category,
                calc_level: this.filterService.getCurrentFilter().calc_level,
              });
            }
          });
        });
      }),
    );
  }

  private processQueryParams(params: any): void {
    let filtersUpdated = false;
    const filter: Filter = { category: '', calc_level: '' };

    // Track if this came from preserved search
    const isPreservedSearch = params['searchPreserved'] === 'true';

    // Check for search parameter
    if (params['search']) {
      this.searchQuery = params['search'];
      console.log('Setting search query to:', this.searchQuery);
    }

    // Apply filters in a specific order

    // First, reset any existing filters
    this.filterService.clearAll();
    this.categoryService.clearAll();

    // Check for level parameter
    if (params['level']) {
      filter.calc_level = params['level'];
      filtersUpdated = true;
    }

    // Check for category parameter - apply this last as it's more important
    if (params['category']) {
      filter.category = params['category'];
      console.log('Processing category from query params:', params['category']);

      // Update services immediately
      this.categoryService.changeCategory(params['category']);
      this.filterService.setCategory(params['category']);
      filtersUpdated = true;
    }

    // Apply filters if needed. Both currentFilter$ (a BehaviorSubject) and
    // applyFilters()'s data source resolve synchronously, so there's no
    // async gap to wait out here.
    if (filtersUpdated) {
      this.isFilterApplied = true;

      this.filterService.updateFilter(filter);
      this.applyFilters(filter);
      this.cdr.detectChanges();

      // Scroll to top after filters are applied
      this.scrollToTop();

      // Check if we should auto-open the details view for an item
      if (params['autoOpenDetails'] === 'true' && params['itemId']) {
        this.autoOpenItemDetails(params['itemId']);
      }
    } else if (this.searchQuery) {
      // If only search is provided with no filters
      this.searchSubject.next({
        query: this.searchQuery,
        immediate: false,
      });

      // Scroll to top after search is applied
      this.scrollToTop();

      // Check if we should auto-open the details view for an item
      if (params['autoOpenDetails'] === 'true' && params['itemId']) {
        this.autoOpenItemDetails(params['itemId']);
      }
    } else {
      // No params, just show all
      this.updateDisplayedOxalates();

      // Scroll to top when showing all results
      this.scrollToTop();

      // Check if we should auto-open the details view for an item
      if (params['autoOpenDetails'] === 'true' && params['itemId']) {
        this.autoOpenItemDetails(params['itemId']);
      }
    }

    // Persist the current search state so closeDetail() can restore the
    // exact same results after the auto-opened detail view (navigated here
    // from a search result) is dismissed.
    if (isPreservedSearch) {
      localStorage.setItem('lastSearchQuery', this.searchQuery || '');
      localStorage.setItem('lastSearchCategory', filter.category || '');
      localStorage.setItem('lastSearchLevel', filter.calc_level || '');
    }

    // Guard: autoOpenDetails=true but itemId missing - remove both params
    if (params['autoOpenDetails'] === 'true' && !params['itemId']) {
      this.clearQueryParams(['autoOpenDetails', 'itemId']);
    }
  }

  private clearQueryParams(params: string[]): void {
    const queryParams = { ...this.route.snapshot.queryParams };
    params.forEach((p) => delete queryParams[p]);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: '',
      replaceUrl: true,
    });
  }

  private autoOpenItemDetails(itemId: string): void {
    if (!itemId) return;

    let foundItem = this.originalOxalates.find((item) => item.id === itemId);

    if (foundItem) {
      this.viewMore(foundItem);
    }

    // originalOxalates is already loaded by this point, so the lookup above
    // should always succeed for a valid itemId. This fallback only matters
    // for a stale/invalid itemId; deferring to a microtask (rather than an
    // arbitrary multi-second timer) still lets the viewMore() call above
    // finish first without an artificial, fixed-length wait.
    Promise.resolve().then(() => {
      if (!this.selectedOxalate) {
        let delayedFoundItem = this.oxalates.find((item) => item.id === itemId);

        // If not found in filtered results, look in the original data
        if (!delayedFoundItem && this.originalOxalates) {
          delayedFoundItem = this.originalOxalates.find(
            (item) => item.id === itemId,
          );

          // If found in original but not in filtered, adjust filters to include it
          if (delayedFoundItem) {
            console.log('Found item in original data, updating filters');
            // Reset filters temporarily to ensure item is visible
            this.filterService.clearAll();
            this.categoryService.clearAll();

            // Apply category from the found item
            this.filterService.setCategory(delayedFoundItem.category);
            this.categoryService.changeCategory(delayedFoundItem.category);

            // Force a data refresh
            this.oxalates = [...this.originalOxalates].filter(
              (ox) =>
                ox &&
                ox.category &&
                delayedFoundItem &&
                delayedFoundItem.category &&
                ox.category.toLowerCase() ===
                  delayedFoundItem.category.toLowerCase(),
            );
            this.updateDisplayedOxalates();
          }
        }

        // If still not found by ID, try finding by name using search parameter
        if (!delayedFoundItem && this.route.snapshot.queryParams['search']) {
          console.log('Item not found by ID, trying to find by name');
          delayedFoundItem = this.findItemByName(
            this.route.snapshot.queryParams['search'],
          );
        }

        if (delayedFoundItem) {
          if (!this.selectedOxalate) {
            this.viewMore(delayedFoundItem);
          }
        } else {
          this.clearQueryParams(['itemId', 'autoOpenDetails']);
        }
      }
    });
  }

  // Handle subsequent category changes
  categoryOnChange() {
    this.subscriptions.push(
      this.categoryService.currentCategory$.subscribe({
        next: (category) => {
          // console.log('Category changed:', category);
          if (category) {
            this.filterService.setCategory(category);
            this.isFilterApplied = true;
            this.applyFilters({
              category: category,
              calc_level: '',
            });
            this.paginationService.changePage(1, this.oxalates.length);

            // Scroll to top after category change
            this.scrollToTop();
          }
        },
        error: (error) => {
          console.error('Error handling category change:', error);
        },
      }),
    );
  }

  filterOnChange() {
    this.subscriptions.push(
      this.filterService.currentFilter$.subscribe({
        next: (filter: Filter) => {
          // console.log('Filter changed:', filter);
          if (filter && (filter.category || filter.calc_level)) {
            this.applyFilters(filter);
          }
        },
        error: (error) => {
          console.error('Error handling filter change:', error);
        },
      }),
    );
  }

  private readonly FOCUSABLE_SELECTORS =
    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), ' +
    'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.selectedOxalate) {
      this.closeDetail();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onFocusTrapKeyDown(event: KeyboardEvent): void {
    if (!this.selectedOxalate || event.key !== 'Tab') return;
    const modal = this.modalContainer?.nativeElement;
    if (!modal) return;

    const focusable = Array.from(
      modal.querySelectorAll<HTMLElement>(this.FOCUSABLE_SELECTORS),
    ).filter((el) => !el.closest('[aria-hidden="true"]'));

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || active === modal) {
        last.focus();
        event.preventDefault();
      }
    } else {
      if (active === last) {
        first.focus();
        event.preventDefault();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    // Clean up event listener properly
    window.removeEventListener('popstate', this.handlePopState);
  }

  private handlePopState = () => {
    if (this.selectedOxalate) {
      this.closeDetail();
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('search')) {
      // Ensure search parameter is restored
      this.searchQuery = urlParams.get('search') || '';

      // Re-apply the search
      if (this.searchQuery) {
        this.searchSubject.next({
          query: this.searchQuery,
          immediate: false,
        });
      }

      // Apply category if present
      if (urlParams.has('category')) {
        const category = urlParams.get('category') || '';
        this.categoryService.changeCategory(category);
        this.filterService.setCategory(category);
      }

      // Apply level if present
      if (urlParams.has('level')) {
        const level = urlParams.get('level') || '';
        this.filterService.updateFilter({ calc_level: level });
      }

      // Force update
      this.cdr.detectChanges();
    }
  };

  private initializeViewMode(): void {
    const savedViewMode = localStorage.getItem('viewMode');
    this.viewMode = (savedViewMode as 'list' | 'grid') || 'list';
  }

  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(
        switchMap(({ query, immediate }) => {
          this.errorState = false;
          const debounceMs = immediate ? 0 : query.length <= 2 ? 500 : 300;
          return of(query).pipe(
            debounceTime(debounceMs),
            distinctUntilChanged(),
            switchMap((q) => {
              this.isLoading = true;
              return this.oxalateService.searchOxalateData(q).pipe(
                finalize(() => {
                  this.isLoading = false;
                  this.cdr.detectChanges();
                }),
              );
            }),
          );
        }),
      )
      .subscribe({
        next: (data) => {
          this.lastSearchQuery = this.searchQuery;
          if (data.length === 0) {
            this.showAlert = true;
            this.alertMessage =
              'No results found. Try different keywords or check your spelling.';
            this.applySearchResults([]);
          } else {
            const sorted = this.sortBySearchTerm(data, this.searchQuery);
            this.applySearchResults(sorted);
            this.showAlert = false;
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.errorState = true;
          this.cdr.detectChanges();
        },
      });
  }

  showSearchPrompt(): boolean {
    const filter = this.filterService.getCurrentFilter();
    const hasActiveFilter = !!(filter?.category || filter?.calc_level);
    return (
      !this.searchQuery?.trim() &&
      !hasActiveFilter &&
      this.originalOxalates.length > 0
    );
  }

  retrySearch(): void {
    this.errorState = false;
    if (this.lastSearchQuery) {
      this.searchSubject.next({
        query: this.lastSearchQuery,
        immediate: true,
      });
    } else {
      this.updateDisplayedOxalates();
    }
    this.cdr.detectChanges();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
    localStorage.setItem('viewMode', this.viewMode);
  }

  getViewModeClass(): string {
    return `${this.viewMode}-view`;
  }

  handleClearSearch(): void {
    console.log('Clearing search and resetting data');
    this.hasSearched = false;
    this.searchQuery = '';
    this.showAlert = false;
    this.isFilterApplied = false;

    // Reset filters
    this.filterService.clearAll();
    this.categoryService.clearAll();
    this.oxalates = [...this.originalOxalates];
    this.paginationService.changePage(1, this.fullDatasetLength);
    const pageSize = this.paginationService.itemsPerPage;
    this.randomItems = this.originalOxalates.slice(0, pageSize);
    this.updateDisplayedOxalates();
    this.cdr.detectChanges();
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;
    this.onSearchQueryChange(query);
  }

  onEnterPressed(): void {
    if (this.searchQuery?.trim()) {
      this.searchSubject.next({
        query: this.searchQuery.trim(),
        immediate: true,
      });
    }
  }

  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.errorState = false;
    if (!query?.trim()) {
      if (this.isFilterApplied) {
        this.oxalates = [...this.originalOxalates];
        this.applyFilters(this.filterService.getCurrentFilter());
      } else {
        this.hasSearched = false;
        this.oxalates = [...this.originalOxalates];
        this.paginationService.changePage(1, this.fullDatasetLength);
        const pageSize = this.paginationService.itemsPerPage;
        this.randomItems = this.originalOxalates.slice(0, pageSize);
        this.updateDisplayedOxalates();
      }
    } else {
      this.searchSubject.next({ query, immediate: false });
    }
  }

  onFilterChanged(filter: Filter): void {
    this.paginationService.changePage(1, this.oxalates.length);
    this.applyFilters(filter);
    if (
      !filter.category &&
      !filter.calc_level &&
      this.searchQuery?.trim()
    ) {
      this.searchSubject.next({
        query: this.searchQuery,
        immediate: true,
      });
    }
  }

  applyFilters(filter: Filter): void {
    if (!this.originalOxalates || this.originalOxalates.length === 0) {
      return;
    }

    // Combine search and filters
    let filteredOxalates$: Observable<Oxalate[]> = of(this.originalOxalates);

    // If there's a search query, perform the advanced search
    if (this.searchQuery?.trim()) {
      filteredOxalates$ = this.oxalateService.searchOxalateData(
        this.searchQuery,
      );
    }

    filteredOxalates$.subscribe((searchResults) => {
      let filteredOxalates = searchResults;

      // Apply category filter
      if (filter.category) {
        // console.log('Filtering by category:', filter.category);
        filteredOxalates = filteredOxalates.filter(
          (oxalate) =>
            oxalate &&
            oxalate.category &&
            oxalate.category.toLowerCase() ===
              (filter.category ?? '').toLowerCase(),
        );
        console.log('Results after category filter:', filteredOxalates.length);
      }

      // Apply calc_level filter
      if (filter.calc_level) {
        // console.log('Filtering by calc_level:', filter.calc_level);
        filteredOxalates = filteredOxalates.filter(
          (oxalate) => oxalate && oxalate.calc_level === filter.calc_level,
        );
        console.log(
          'Results after calc_level filter:',
          filteredOxalates.length,
        );
      }

      if (filter.category || filter.calc_level) {
        this.applySearchResults(filteredOxalates);
        this.isFilterApplied = true;
      } else {
        if (this.searchQuery?.trim()) {
          this.applySearchResults(filteredOxalates);
        } else {
          this.oxalates = filteredOxalates;
          this.updateDisplayedOxalates();
        }
      }
      this.cdr.detectChanges();

      // Scroll to top after filters are applied and results are updated
      this.scrollToTop();
    });
  }

  private applySearch(items: Oxalate[], query: string): Oxalate[] {
    const searchLower = query.toLowerCase();
    return items.filter((oxalate) => {
      return (
        oxalate &&
        ((oxalate.item && oxalate.item.toLowerCase().includes(searchLower)) ||
          (oxalate.category &&
            oxalate.category.toLowerCase().includes(searchLower)) ||
          (oxalate.level && oxalate.level.toString().includes(searchLower)) ||
          (oxalate.calc_level &&
            oxalate.calc_level.toLowerCase().includes(searchLower)))
      );
    });
  }

  clearFilters(): void {
    this.hasSearched = false;
    this.categoryService.clearAll();
    this.filterService.clearAll();
    this.searchQuery = '';
    this.isFilterApplied = false;
    this.oxalates = [...this.originalOxalates];

    this.paginationService.changePage(1, this.fullDatasetLength);
    const pageSize = this.paginationService.itemsPerPage;
    this.randomItems = this.originalOxalates.slice(0, pageSize);
    this.updateDisplayedOxalates();
  }

  resetData(): void {
    this.oxalates = [...this.originalOxalates];
    this.updateDisplayedOxalates();
  }

  private applySearchResults(results: Oxalate[]): void {
    this.oxalates = results;
    this.hasSearched =
      results.length > 0 || (this.searchQuery?.length ?? 0) > 0;
    this.paginationService.changePage(1, this.oxalates.length);
    this.updateDisplayedOxalates();
  }

  updateDisplayedOxalates(): void {
    const totalPages = Math.ceil(
      this.oxalates.length / this.paginationService.itemsPerPage
    );
    if (
      this.paginationService.currentPage > totalPages &&
      totalPages > 0
    ) {
      this.paginationService.changePage(1, this.oxalates.length);
    }
    this.displayedOxalates = this.paginationService.updateDisplayedItems(
      this.oxalates,
    );
  }

  getPages(): (number | string)[] {
    const total = this.hasSearched ? this.oxalates.length : this.fullDatasetLength;
    return this.paginationService.getPages(total);
  }

  changePage(page: number | string): void {
    if (!this.hasSearched) {
      if (typeof page !== 'number') return;
      this.paginationService.changePage(page, this.fullDatasetLength);
      const pageSize = this.paginationService.itemsPerPage;
      const fullDataset = this.originalOxalates?.length
        ? this.originalOxalates
        : this.oxalates;
      this.randomItems = fullDataset.slice(
        (page - 1) * pageSize,
        page * pageSize
      );
      this.cdr.detectChanges();
      return;
    }
    if (typeof page !== 'number') return;
    this.paginationService.changePage(page, this.oxalates.length);
    this.updateDisplayedOxalates();
    this.cdr.detectChanges();
  }

  viewMore(oxalate: Oxalate, event?: Event): void {
    this.focusRestoreTarget = (event?.target as HTMLElement) || null;
    this.selectedOxalate = oxalate;
    document.body.style.overflow = 'hidden';
    history.pushState({ modalOpen: true }, '', window.location.href);

    requestAnimationFrame(() => {
      this.cdr.detectChanges();
      this.focusModalContainer();
    });
  }

  focusModalContainer(): void {
    const modal = this.modalContainer?.nativeElement;
    if (!modal) return;
    const firstFocusable = modal.querySelector<HTMLElement>(
      this.FOCUSABLE_SELECTORS,
    );
    (firstFocusable ?? modal).focus();
  }

  closeDetail(): void {
    if (this.focusRestoreTarget?.focus) {
      this.focusRestoreTarget.focus();
    }
    this.focusRestoreTarget = null;

    // Save references to current state before closing modal
    const currentSearchQuery = this.searchQuery;
    const currentFilters = this.filterService.getCurrentFilter();
    const wasFilterApplied = this.isFilterApplied;
    const cachedResults = [...this.oxalates]; // Cache current results

    // Close the modal immediately
    this.selectedOxalate = undefined;
    document.body.style.overflow = '';

    // Get stored search parameters
    const storedSearchQuery = localStorage.getItem('lastSearchQuery');
    const storedCategory = localStorage.getItem('lastSearchCategory');
    const storedLevel = localStorage.getItem('lastSearchLevel');

    // Determine which search state to use and apply it immediately
    if (storedSearchQuery) {
      // Update search query in the UI
      this.searchQuery = storedSearchQuery;

      if (storedCategory) {
        this.categoryService.changeCategory(storedCategory);
        this.filterService.setCategory(storedCategory);
      }
      if (storedLevel) {
        this.filterService.updateFilter({ calc_level: storedLevel });
      }

      // Reuse the same search (Fuse.js) used for live typing, so results
      // restored after closing the detail view match what search actually
      // returns instead of a separate, weaker substring match. Data is
      // already loaded/cached at this point, so this resolves synchronously.
      this.oxalateService
        .searchOxalateData(storedSearchQuery)
        .subscribe((searchResults) => {
          let filteredOxalates = searchResults;

          if (storedCategory) {
            filteredOxalates = filteredOxalates.filter(
              (oxalate) =>
                oxalate &&
                oxalate.category &&
                oxalate.category.toLowerCase() ===
                  storedCategory.toLowerCase(),
            );
          }

          if (storedLevel) {
            filteredOxalates = filteredOxalates.filter(
              (oxalate) => oxalate && oxalate.calc_level === storedLevel,
            );
          }

          this.oxalates = this.sortBySearchTerm(
            filteredOxalates,
            storedSearchQuery,
          );
          this.isFilterApplied = !!(storedCategory || storedLevel);
          this.updateDisplayedOxalates();
          this.cdr.detectChanges();
        });

      // Clear stored values
      localStorage.removeItem('lastSearchQuery');
      localStorage.removeItem('lastSearchCategory');
      localStorage.removeItem('lastSearchLevel');
    }
    // If no stored parameters, use current state
    else if (currentSearchQuery) {
      console.log('Maintaining current search results:', currentSearchQuery);

      // Use cached results to avoid any delay
      this.oxalates = cachedResults;

      // Make sure filters are still applied
      if (wasFilterApplied) {
        this.isFilterApplied = true;
        this.filterService.updateFilter(currentFilters);
      }

      // Ensure pagination is updated
      this.updateDisplayedOxalates();
      this.cdr.detectChanges();
    }
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
    if (!data || !searchTerm) {
      return data || [];
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const calculateItemScore = (item: string, term: string) => {
      if (!item) return 0;
      const lowerCaseItem = item.toLowerCase();
      if (lowerCaseItem === term) return 4;
      if (lowerCaseItem.startsWith(term)) return 3;
      if (lowerCaseItem.includes(term)) return 2;
      return 0;
    };

    const calculateCategoryScore = (category: string, term: string) => {
      if (!category) return 0;
      const lowerCaseCategory = category.toLowerCase();
      if (
        lowerCaseCategory.includes(term) ||
        term.includes(lowerCaseCategory)
      ) {
        return 1;
      }
      return 0;
    };

    const scoredItems = data
      .filter(
        (oxalate) =>
          oxalate &&
          ((oxalate.item &&
            oxalate.item.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (oxalate.category &&
              oxalate.category.toLowerCase().includes(lowerCaseSearchTerm))),
      )
      .map((oxalate) => {
        const itemScore = calculateItemScore(
          oxalate.item || '',
          lowerCaseSearchTerm,
        );
        const categoryScore =
          itemScore === 0
            ? calculateCategoryScore(
                oxalate.category || '',
                lowerCaseSearchTerm,
              )
            : 0;
        return {
          ...oxalate,
          relevanceScore: itemScore || categoryScore,
        };
      });

    scoredItems.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return (
        a.item?.toLowerCase().localeCompare(b.item?.toLowerCase() || '') || 0
      );
    });

    return scoredItems;
  }

  // Fallback method if item not found by ID
  private findItemByName(name: string): Oxalate | undefined {
    if (!name || !this.originalOxalates) return undefined;

    const searchName = name.toLowerCase().trim();

    // Try exact match first
    let foundItem = this.originalOxalates.find(
      (item) => item.item.toLowerCase() === searchName,
    );

    // If not found, try contains match
    if (!foundItem) {
      foundItem = this.originalOxalates.find((item) =>
        item.item.toLowerCase().includes(searchName),
      );
    }

    return foundItem;
  }

  private setupNavigationHandling(): void {
    // Listen for browser navigation events
    window.addEventListener('popstate', this.handlePopState);
  }

  private scrollToTop(): void {
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
