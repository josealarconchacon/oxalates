import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { OxalateService } from '../service/oxalate.service';
import { FilterService } from './service/filter.service';
import { Filter } from './filter/model/filter';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
  itemsPerPage: number = 12;
  currentPage: number = 1;
  totalPages: number = 1;
  pagesToShow: number = 5;

  // Subject for debounced search
  private searchSubject: Subject<string> = new Subject<string>();

  constructor(
    private oxalateService: OxalateService,
    private filterService: FilterService,
    private router: Router,
    private cdr: ChangeDetectorRef
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

    // Subscribe to the debounced search query
    this.searchSubject
      .pipe(
        debounceTime(300), // Wait for 300ms after typing stops
        distinctUntilChanged(), // Only trigger if the query has changed
        switchMap((query) => this.oxalateService.searchOxalateData(query))
      )
      .subscribe((data) => {
        if (data.length === 0) {
          this.showAlert = true;
          this.alertMessage = 'No results found for your search.';
          this.resetData();
        } else {
          this.oxalates = data;
          this.updateDisplayedOxalates();
          this.showAlert = false;
        }
      });
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

    // Filter based on the filter criteria
    this.oxalates = this.originalOxalates.filter((oxalate) => {
      return (
        (!filter.category || oxalate.category === filter.category) &&
        (!filter.calc_level || oxalate.calc_level === filter.calc_level) &&
        (!filter.level || Number(oxalate.level) === Number(filter.level))
      );
    });

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
    this.totalPages = Math.ceil(this.oxalates.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedOxalates = this.oxalates.slice(startIndex, endIndex);
  }

  getPages(): (number | string)[] {
    const pages = [];
    const half = Math.floor(this.pagesToShow / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, this.currentPage + half);

    if (this.currentPage - half < 1) {
      end = Math.min(this.totalPages, end + (half - this.currentPage + 1));
    }
    if (this.currentPage + half > this.totalPages) {
      start = Math.max(1, start - (this.currentPage + half - this.totalPages));
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < this.totalPages) {
      if (end < this.totalPages - 1) {
        pages.push('...');
      }
      pages.push(this.totalPages);
    }

    return pages;
  }

  changePage(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedOxalates();
    }
  }

  viewMore(oxalate: Oxalate): void {
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
}
