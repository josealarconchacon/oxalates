// import { Component, OnInit } from '@angular/core';
// import { Oxalate } from 'src/app/landing-page/model/oxalate';
// import { OxalateService } from 'src/app/landing-page/service/oxalate.service';
// import { FilterService } from './service/filter.service';
// import { Filter } from './filter/model/filter';

// @Component({
//   selector: 'app-oxalate',
//   templateUrl: './oxalate.component.html',
//   styleUrls: ['./oxalate.component.css'],
// })
// export class OxalateComponent implements OnInit {
//   oxalates: Oxalate[] = [];
//   displayedOxalates: Oxalate[] = [];
//   searchQuery: string = '';
//   isFilterApplied: boolean = false; // Track if the filter is applied

//   constructor(
//     private oxalateService: OxalateService,
//     private filterService: FilterService
//   ) {}

//   ngOnInit(): void {
//     this.filterService.currentFilter$.subscribe((filter: Filter) => {
//       if (filter) {
//         this.applyFilters(filter);
//       }
//     });

//     this.oxalateService.getOxalateData().subscribe((data) => {
//       this.oxalates = data;
//       this.displayedOxalates = data; // Set initial displayed items
//     });
//   }

//   search(): void {
//     if (this.searchQuery.trim() !== '') {
//       this.oxalateService
//         .searchOxalateData(this.searchQuery.trim())
//         .subscribe((data) => {
//           this.displayedOxalates = data.slice(0, 6);
//         });
//     } else {
//       this.displayedOxalates = this.oxalates.slice(0, 6);
//     }
//   }

//   applyFilters(filter: Filter): void {
//     if (this.oxalates.length === 0) {
//       console.warn('No oxalates data to filter.');
//       return;
//     }

//     this.displayedOxalates = this.oxalates.filter((oxalate) => {
//       return (
//         (!filter.category || oxalate.category === filter.category) &&
//         (!filter.calc_level || oxalate.calc_level === filter.calc_level) &&
//         (!filter.level || Number(oxalate.level) === Number(filter.level)) &&
//         (!filter.item ||
//           oxalate.item.toLowerCase().includes(filter.item.toLowerCase())) &&
//         (!filter.total_oxalate_mg_per_100g ||
//           Number(oxalate.total_oxalate_mg_per_100g) ===
//             Number(filter.total_oxalate_mg_per_100g)) &&
//         (!filter.total_soluble_oxalate_mg_per_100g ||
//           Number(oxalate.total_soluble_oxalate_mg_per_100g) ===
//             Number(filter.total_soluble_oxalate_mg_per_100g)) &&
//         (!filter.serving_size ||
//           oxalate.serving_size === filter.serving_size) &&
//         (!filter.serving_g ||
//           Number(oxalate.serving_g) === Number(filter.serving_g))
//       );
//     });

//     this.isFilterApplied = true; // Set filter applied state
//   }

//   clearFilters(): void {
//     this.displayedOxalates = this.oxalates.slice(0, 6); // Reset to initial data
//     this.isFilterApplied = false; // Reset filter applied state
//   }
// }

import { Component, OnInit } from '@angular/core';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { OxalateService } from 'src/app/landing-page/service/oxalate.service';
import { FilterService } from './service/filter.service';
import { Filter } from './filter/model/filter';

@Component({
  selector: 'app-oxalate',
  templateUrl: './oxalate.component.html',
  styleUrls: ['./oxalate.component.css'],
})
export class OxalateComponent implements OnInit {
  oxalates: Oxalate[] = [];
  displayedOxalates: Oxalate[] = [];
  searchQuery: string = '';
  isFilterApplied: boolean = false;

  itemsPerPage: number = 12;
  currentPage: number = 1;
  totalPages: number = 1;
  pagesToShow: number = 5;

  constructor(
    private oxalateService: OxalateService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.filterService.currentFilter$.subscribe((filter: Filter) => {
      if (filter) {
        this.applyFilters(filter);
      }
    });

    this.oxalateService.getOxalateData().subscribe((data) => {
      this.oxalates = data;
      this.updateDisplayedOxalates();
    });
  }

  search(): void {
    if (this.searchQuery.trim() !== '') {
      this.oxalateService
        .searchOxalateData(this.searchQuery.trim())
        .subscribe((data) => {
          this.oxalates = data;
          this.updateDisplayedOxalates();
        });
    } else {
      this.oxalateService.getOxalateData().subscribe((data) => {
        this.oxalates = data;
        this.updateDisplayedOxalates();
      });
    }
  }

  applyFilters(filter: Filter): void {
    if (this.oxalates.length === 0) {
      console.warn('No oxalates data to filter.');
      return;
    }

    this.oxalates = this.oxalates.filter((oxalate) => {
      return (
        (!filter.category || oxalate.category === filter.category) &&
        (!filter.calc_level || oxalate.calc_level === filter.calc_level) &&
        (!filter.level || Number(oxalate.level) === Number(filter.level)) &&
        (!filter.item ||
          oxalate.item.toLowerCase().includes(filter.item.toLowerCase())) &&
        (!filter.total_oxalate_mg_per_100g ||
          Number(oxalate.total_oxalate_mg_per_100g) ===
            Number(filter.total_oxalate_mg_per_100g)) &&
        (!filter.total_soluble_oxalate_mg_per_100g ||
          Number(oxalate.total_soluble_oxalate_mg_per_100g) ===
            Number(filter.total_soluble_oxalate_mg_per_100g)) &&
        (!filter.serving_size ||
          oxalate.serving_size === filter.serving_size) &&
        (!filter.serving_g ||
          Number(oxalate.serving_g) === Number(filter.serving_g))
      );
    });

    this.isFilterApplied = true;
    this.updateDisplayedOxalates();
  }

  clearFilters(): void {
    this.oxalateService.getOxalateData().subscribe((data) => {
      this.oxalates = data;
      this.updateDisplayedOxalates();
    });
    this.isFilterApplied = false;
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
}
