import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { OxalateService } from '../service/oxalate.service';
import { FilterService } from './service/filter.service';
import { Filter } from './filter/model/filter';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PaginationService } from './service/pagination.service';
import { CategoryService } from './service/category.service';

@Component({
  selector: 'app-oxalate',
  templateUrl: './oxalate.component.html',
  styleUrls: ['./oxalate.component.css'],
})
export class OxalateComponent implements OnInit {
  oxalates: Oxalate[] = [];
  originalOxalates: Oxalate[] = [];
  displayedOxalates: Oxalate[] = [];
  searchQuery: string = '';
  isFilterApplied: boolean = false;
  selectedOxalate: Oxalate | undefined;

  showAlert: boolean = false;
  alertMessage: string = '';

  // Subject for debounced search
  private searchSubject: Subject<string> = new Subject<string>();

  constructor(
    private oxalateService: OxalateService,
    private filterService: FilterService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private paginationService: PaginationService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.oxalateService.getOxalateData().subscribe((data) => {
      this.oxalates = data;
      this.originalOxalates = [...data]; // Preserve the original data
      this.updateDisplayedOxalates();
    });

    this.filterService.currentFilter$.subscribe((filter: Filter) => {
      if (filter) {
        this.applyFilters(filter);
      }
    });
    this.filterService.clearSearch$.subscribe(() => {
      this.searchQuery = '';
      this.resetData();
    });
    this.categoryService.currentCategory.subscribe((category) => {
      if (!category) {
        // Reset category-specific state if needed
        this.resetData();
      }
    });

    // Subscribe to the debounced search query
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.oxalateService.searchOxalateData(query))
      )
      .subscribe((data) => {
        if (data.length === 0) {
          this.showAlert = true;
          this.alertMessage = 'No results found for your search.';
          this.resetData();
        } else {
          this.oxalates = this.sortBySearchTerm(data, this.searchQuery);
          this.updateDisplayedOxalates();
          this.showAlert = false;
        }
      });

    // Subscribe to the search query from CategoryService
    this.categoryService.currentSearchQuery.subscribe((query) => {
      this.searchQuery = query;
      this.onSearchQueryChange(query);
    });
  }

  updateData() {
    // Update the data
    this.cdr.detectChanges();
  }

  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  applyFilters(filter: Filter): void {
    if (this.originalOxalates.length === 0) {
      console.warn('No oxalates data to filter.');
      return;
    }
    let filteredOxalates = this.originalOxalates.filter((oxalate) => {
      const matchesSearchQuery =
        !this.searchQuery ||
        (oxalate.item &&
          oxalate.item
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())) ||
        (oxalate.category &&
          oxalate.category
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())) ||
        (oxalate.level &&
          oxalate.level.toString().includes(this.searchQuery)) ||
        (oxalate.calc_level &&
          oxalate.calc_level
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()));

      return matchesSearchQuery;
    });

    // Apply the dropdown filters after the search query
    filteredOxalates = filteredOxalates.filter((oxalate) => {
      return (
        (!filter.category || oxalate.category === filter.category) &&
        (!filter.calc_level || oxalate.calc_level === filter.calc_level) &&
        (!filter.level || Number(oxalate.level) === Number(filter.level))
      );
    });

    this.oxalates = filteredOxalates;
    this.isFilterApplied = true;
    this.updateDisplayedOxalates();
  }

  clearFilters(): void {
    this.resetData();
    this.isFilterApplied = false;
  }

  resetData(): void {
    this.oxalates = [...this.originalOxalates];
    this.updateDisplayedOxalates();
  }

  updateDisplayedOxalates(): void {
    this.displayedOxalates = this.paginationService.updateDisplayedItems(
      this.oxalates
    );
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
      const aStartsWith = a.item.toLowerCase().startsWith(lowerCaseSearchTerm);
      const bStartsWith = b.item.toLowerCase().startsWith(lowerCaseSearchTerm);

      if (aStartsWith && !bStartsWith) {
        return -1;
      } else if (!aStartsWith && bStartsWith) {
        return 1;
      } else {
        return a.item.localeCompare(b.item, undefined, { sensitivity: 'base' });
      }
    });
  }
}
