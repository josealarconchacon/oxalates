import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
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
import { combineLatest, Observable, of, Subject, Subscription } from 'rxjs';
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
  isDarkTheme: boolean = false;

  searchQuery: string = '';
  alertMessage: string = '';
  showAlert: boolean = false;
  isLoading: boolean = false;
  isFilterApplied: boolean = false;
  selectedOxalate: Oxalate | undefined;
  viewMode: 'list' | 'grid' = 'list';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public filterService: FilterService,
    private oxalateService: OxalateService,
    private categoryService: CategoryService,
    private paginationService: PaginationService,
    private themeService: ThemeService
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
      })
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

          // Process parameters in sequence
          this.processQueryParams(params);

          // Additional check: if category was set in services but not in params, apply it
          const currentCategory = this.categoryService.currentCategory$.pipe(
            take(1)
          );
          currentCategory.subscribe((category) => {
            if (category && !params['category']) {
              console.log(
                'Category found in service but not in params, applying:',
                category
              );
              this.applyFilters({
                category: category,
                calc_level: this.filterService.getCurrentFilter().calc_level,
              });
            }
          });
        });
      })
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

      // Force the dropdown to update by emitting the category again after a short delay
      setTimeout(() => {
        this.categoryService.changeCategory(params['category']);
        this.cdr.detectChanges();
      }, 100);
    }

    // Apply filters if needed with a slight delay to ensure services have updated
    if (filtersUpdated) {
      this.isFilterApplied = true;

      // Update the filter service first
      this.filterService.updateFilter(filter);

      // Then apply filters with a short delay
      setTimeout(() => {
        this.applyFilters(filter);
        this.cdr.detectChanges();

        // Scroll to top after filters are applied
        this.scrollToTop();

        // Check if we should auto-open the details view for an item
        if (params['autoOpenDetails'] === 'true' && params['itemId']) {
          this.autoOpenItemDetails(params['itemId']);
        }
      }, 300);
    } else if (this.searchQuery) {
      // If only search is provided with no filters
      this.searchSubject.next(this.searchQuery);

      // Scroll to top after search is applied
      setTimeout(() => {
        this.scrollToTop();
      }, 300);

      // Check if we should auto-open the details view for an item
      if (params['autoOpenDetails'] === 'true' && params['itemId']) {
        this.autoOpenItemDetails(params['itemId']);
      }
    } else {
      // No params, just show all
      this.updateDisplayedOxalates();

      // Scroll to top when showing all results
      setTimeout(() => {
        this.scrollToTop();
      }, 100);

      // Check if we should auto-open the details view for an item
      if (params['autoOpenDetails'] === 'true' && params['itemId']) {
        this.autoOpenItemDetails(params['itemId']);
      }
    }

    // Store the original search parameters to preserve them when closing the modal
    if (isPreservedSearch) {
      // Store the parameters to be used when modal is closed
      localStorage.setItem('lastSearchQuery', this.searchQuery || '');
      localStorage.setItem('lastSearchCategory', filter.category || '');
      localStorage.setItem('lastSearchLevel', filter.calc_level || '');
    }
  }

  private autoOpenItemDetails(itemId: string): void {
    console.log('Attempting to open details for item ID:', itemId);

    // First try to find by ID immediately (in case it's already loaded)
    let foundItem = this.originalOxalates.find((item) => item.id === itemId);

    if (foundItem) {
      console.log('Found item immediately, opening details:', foundItem.item);
      // Try to open it immediately first
      this.viewMore(foundItem);
    }

    // Also try with a delay as a fallback in case the first attempt doesn't work
    setTimeout(() => {
      // Try to find item in the filtered results first if we didn't find it immediately
      if (!this.selectedOxalate) {
        let delayedFoundItem = this.oxalates.find((item) => item.id === itemId);

        // If not found in filtered results, look in the original data
        if (!delayedFoundItem && this.originalOxalates) {
          delayedFoundItem = this.originalOxalates.find(
            (item) => item.id === itemId
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
                  delayedFoundItem.category.toLowerCase()
            );
            this.updateDisplayedOxalates();
          }
        }

        // If still not found by ID, try finding by name using search parameter
        if (!delayedFoundItem && this.route.snapshot.queryParams['search']) {
          console.log('Item not found by ID, trying to find by name');
          delayedFoundItem = this.findItemByName(
            this.route.snapshot.queryParams['search']
          );
        }

        if (delayedFoundItem) {
          console.log(
            'Found item after delay, opening details:',
            delayedFoundItem.item
          );
          // Only open if not already opened
          if (!this.selectedOxalate) {
            this.viewMore(delayedFoundItem);
          }
        } else {
          console.warn('Item with ID', itemId, 'not found in data after delay');

          // Final fallback - try to open any item that matches the search query
          if (
            this.route.snapshot.queryParams['search'] &&
            this.oxalates.length > 0
          ) {
            console.log('Trying fallback - opening first item from results');
            this.viewMore(this.oxalates[0]);
          }
        }
      }
    }, 2000); // Use a longer delay as a final fallback
  }

  private initializeWithRouteParams(): void {
    // Get initial data combine with route parameters
    this.subscriptions.push(
      combineLatest([
        this.oxalateService.getOxalateData(),
        this.categoryService.currentCategory$.pipe(take(1)),
      ]).subscribe({
        next: ([data, category]) => {
          // console.log('Initial data fetched:', data);
          // console.log('Initial category:', category);

          this.oxalates = data;
          this.originalOxalates = [...data];

          // If there's a category from the route, apply it
          if (category) {
            // console.log('Applying initial category filter:', category);
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
            setTimeout(() => {
              this.scrollToTop();
            }, 100);
          }
        },
        error: (error) => {
          console.error('Error handling category change:', error);
        },
      })
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
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    // Clean up event listener
    window.removeEventListener('popstate', () => {});
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

            // Scroll to top after search results are displayed
            setTimeout(() => {
              this.scrollToTop();
            }, 100);
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

  handleClearSearch(): void {
    console.log('Clearing search and resetting data');
    this.searchQuery = '';
    this.showAlert = false;
    this.isFilterApplied = false;

    // Reset filters
    this.filterService.clearAll();
    this.categoryService.clearAll();
    this.oxalates = [...this.originalOxalates];
    this.updateDisplayedOxalates();
    this.cdr.detectChanges();
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;
    this.onSearchQueryChange(query);
  }

  // Update existing search-related methods
  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    if (!query) {
      // If query is empty but not from clear button, just reset search results
      this.oxalates = [...this.originalOxalates];
      if (this.isFilterApplied) {
        // If filters are applied, reapply them
        this.applyFilters(this.filterService.getCurrentFilter());
      } else {
        this.updateDisplayedOxalates();
      }
    } else {
      this.searchSubject.next(query);
    }
  }

  applyFilters(filter: Filter): void {
    // console.log('Applying filters:', filter);

    if (!this.originalOxalates || this.originalOxalates.length === 0) {
      // console.warn('No oxalates data to filter.');
      return;
    }

    // Combine search and filters
    let filteredOxalates$: Observable<Oxalate[]> = of(this.originalOxalates);

    // If there's a search query, perform the advanced search
    if (this.searchQuery?.trim()) {
      filteredOxalates$ = this.oxalateService.searchOxalateData(
        this.searchQuery
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
              (filter.category ?? '').toLowerCase()
        );
        console.log('Results after category filter:', filteredOxalates.length);
      }

      // Apply calc_level filter
      if (filter.calc_level) {
        // console.log('Filtering by calc_level:', filter.calc_level);
        filteredOxalates = filteredOxalates.filter(
          (oxalate) => oxalate && oxalate.calc_level === filter.calc_level
        );
        console.log(
          'Results after calc_level filter:',
          filteredOxalates.length
        );
      }

      // Update results only if there's a change
      if (JSON.stringify(this.oxalates) !== JSON.stringify(filteredOxalates)) {
        this.oxalates = filteredOxalates;
        this.isFilterApplied = true;
        console.log('Filters applied successfully.');
      } else {
        console.log('No changes detected after applying filters.');
      }

      this.updateDisplayedOxalates();
      this.cdr.detectChanges();

      // Scroll to top after filters are applied and results are updated
      setTimeout(() => {
        this.scrollToTop();
      }, 100);
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
    console.log('Opening details for:', oxalate.item);
    this.selectedOxalate = oxalate;
    document.body.style.overflow = 'hidden';

    // Force several change detection cycles to ensure the view updates
    this.cdr.detectChanges();

    // Also use a timeout as a backup
    setTimeout(() => {
      // Double-check that the selection is still valid
      if (!this.selectedOxalate) {
        this.selectedOxalate = oxalate;
      }
      this.cdr.detectChanges();

      // Check the modal dom element to verify it exists
      const modalElement = document.querySelector('.modal-overlay');
      if (!modalElement) {
        console.warn('Modal element not found in DOM, forcing another update');
        this.forceShowModal(oxalate);
      }
    }, 100);
  }

  // Force modal to show as a last resort
  private forceShowModal(oxalate: Oxalate): void {
    // Try one more time with a longer delay
    setTimeout(() => {
      this.selectedOxalate = oxalate;
      document.body.style.overflow = 'hidden';
      this.cdr.detectChanges();

      // Check if the modal element exists now
      const modalElement = document.querySelector('.modal-overlay');
      if (!modalElement) {
        console.error('Modal still not showing after multiple attempts');
      }
    }, 500);
  }

  closeDetail(): void {
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
      console.log('Restoring search from localStorage:', storedSearchQuery);

      // Update search query in the UI
      this.searchQuery = storedSearchQuery;

      // Apply filters immediately without waiting for observable
      let filteredOxalates = [...this.originalOxalates];

      // First apply basic search filter
      filteredOxalates = filteredOxalates.filter(
        (oxalate) =>
          oxalate &&
          oxalate.item &&
          oxalate.item.toLowerCase().includes(storedSearchQuery.toLowerCase())
      );

      // Apply category filter if present
      if (storedCategory) {
        this.categoryService.changeCategory(storedCategory);
        this.filterService.setCategory(storedCategory);
        filteredOxalates = filteredOxalates.filter(
          (oxalate) =>
            oxalate &&
            oxalate.category &&
            oxalate.category.toLowerCase() === storedCategory.toLowerCase()
        );
      }

      // Apply level filter if present
      if (storedLevel) {
        this.filterService.updateFilter({ calc_level: storedLevel });
        filteredOxalates = filteredOxalates.filter(
          (oxalate) => oxalate && oxalate.calc_level === storedLevel
        );
      }

      // Update displayed results immediately
      this.oxalates = filteredOxalates;
      this.isFilterApplied = storedCategory || storedLevel ? true : false;
      this.updateDisplayedOxalates();
      this.cdr.detectChanges();

      // Sort results by relevance (matching the search method behavior)
      if (filteredOxalates.length > 0) {
        this.oxalates = this.sortBySearchTerm(
          filteredOxalates,
          storedSearchQuery
        );
        this.updateDisplayedOxalates();
        this.cdr.detectChanges();
      }

      // Also trigger the real search to update with exact server results
      this.searchSubject.next(storedSearchQuery);

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

    const calculateRelevanceScore = (item: string, term: string) => {
      if (!item) return 0;
      const lowerCaseItem = item.toLowerCase();
      if (lowerCaseItem === term) {
        return 3;
      } else if (lowerCaseItem.startsWith(term)) {
        return 2;
      } else if (lowerCaseItem.includes(term)) {
        return 1;
      }
      return 0;
    };

    const scoredItems = data
      .filter(
        (oxalate) =>
          oxalate &&
          oxalate.item &&
          oxalate.item.toLowerCase().includes(lowerCaseSearchTerm)
      )
      .map((oxalate) => ({
        ...oxalate,
        relevanceScore: calculateRelevanceScore(
          oxalate.item,
          lowerCaseSearchTerm
        ),
      }));

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
      (item) => item.item.toLowerCase() === searchName
    );

    // If not found, try contains match
    if (!foundItem) {
      foundItem = this.originalOxalates.find((item) =>
        item.item.toLowerCase().includes(searchName)
      );
    }

    return foundItem;
  }

  private setupNavigationHandling(): void {
    // Listen for browser navigation events
    window.addEventListener('popstate', () => {
      // Get query params from URL
      const urlParams = new URLSearchParams(window.location.search);

      if (urlParams.has('search')) {
        // Ensure search parameter is restored
        this.searchQuery = urlParams.get('search') || '';

        // Re-apply the search
        if (this.searchQuery) {
          this.searchSubject.next(this.searchQuery);
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
    });
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
