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
  isFilterApplied: boolean = false; // Track if the filter is applied

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
      this.displayedOxalates = data; // Set initial displayed items
    });
  }

  search(): void {
    if (this.searchQuery.trim() !== '') {
      this.oxalateService
        .searchOxalateData(this.searchQuery.trim())
        .subscribe((data) => {
          this.displayedOxalates = data.slice(0, 6); // Display first 6 items from the search results
        });
    } else {
      this.displayedOxalates = this.oxalates.slice(0, 6); // Display first 6 items if no search query
    }
  }

  applyFilters(filter: Filter): void {
    if (this.oxalates.length === 0) {
      console.warn('No oxalates data to filter.');
      return;
    }

    this.displayedOxalates = this.oxalates.filter((oxalate) => {
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

    this.isFilterApplied = true; // Set filter applied state
  }

  clearFilters(): void {
    this.displayedOxalates = this.oxalates.slice(0, 6); // Reset to initial data
    this.isFilterApplied = false; // Reset filter applied state
  }
}
