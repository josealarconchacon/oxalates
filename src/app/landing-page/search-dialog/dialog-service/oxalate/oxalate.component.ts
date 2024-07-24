import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { OxalateService } from 'src/app/landing-page/service/oxalate.service';

@Component({
  selector: 'app-oxalate',
  templateUrl: './oxalate.component.html',
  styleUrls: ['./oxalate.component.css'],
})
export class OxalateComponent {
  oxalates: Oxalate[] = [];
  displayedOxalates: Oxalate[] = [];
  searchQuery: string = '';

  private searchTerms = new Subject<string>();

  constructor(private oxalateService: OxalateService) {}

  ngOnInit(): void {
    this.searchTerms
      .pipe(
        debounceTime(300), // Debounce user input for 300ms
        distinctUntilChanged(), // Ensure the search term has changed
        switchMap((query: string) =>
          this.oxalateService.searchOxalateData(query)
        )
      )
      .subscribe((data) => {
        this.displayedOxalates = data.slice(0, 200); // Update the displayed items based on search results
      });
  }

  search(): void {
    if (this.searchQuery.trim() !== '') {
      this.oxalateService
        .searchOxalateData(this.searchQuery.trim())
        .subscribe((data) => {
          this.displayedOxalates = data.slice(0, 6); // Display first 6 items from the search results, fix this
        });
    } else {
      this.displayedOxalates = this.oxalates.slice(0, 6); // Display first 6 items if no search query
    }
    this.searchTerms.next(this.searchQuery);
  }
}

/**
 * import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { OxalateService } from 'src/app/landing-page/service/oxalate.service';
import { Filter } from './filter/model/filter';
import { OxalateData } from './filter/model/oxalate-data';

@Component({
  selector: 'app-oxalate',
  templateUrl: './oxalate.component.html',
  styleUrls: ['./oxalate.component.css'],
})
export class OxalateComponent {
  oxalates: Oxalate[] = []; // Raw data
  displayedOxalates: OxalateData[] = []; // Data to be displayed

  searchQuery: string = '';
  private searchTerms = new Subject<string>();
  private filters: Filter = {};

  constructor(private oxalateService: OxalateService) {}

  ngOnInit(): void {
    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query: string) =>
          this.oxalateService.searchOxalateData(query)
        )
      )
      .subscribe((data) => {
        this.oxalates = data; // Update raw data
        this.applyFiltersToData(); // Apply filters to updated raw data
      });
  }

  search(): void {
    if (this.searchQuery.trim() !== '') {
      this.oxalateService
        .searchOxalateData(this.searchQuery.trim())
        .subscribe((data) => {
          this.oxalates = data; // Update raw data
          this.applyFiltersToData(); // Apply filters to updated raw data
        });
    } else {
      this.applyFiltersToData(); // Apply filters to existing raw data
    }
    this.searchTerms.next(this.searchQuery);
  }

  onFilterChanged(filters: Filter): void {
    this.filters = filters;
    this.applyFiltersToData(); // Apply filters to existing raw data
  }

  private applyFiltersToData(): void {
    this.displayedOxalates = this.oxalates
      .map((item) => this.convertToOxalateData(item)) // Convert each Oxalate item to OxalateData
      .filter((item) => {
        return Object.keys(this.filters).every((key) => {
          const filterValue = this.filters[key as keyof Filter];

          // Skip filtering if filter value is undefined or empty
          if (filterValue === undefined || filterValue === '') return true;

          // Check type of filterValue and compare accordingly
          if (typeof filterValue === 'number') {
            return item[key as keyof OxalateData] === filterValue;
          } else if (typeof filterValue === 'string') {
            // Check if item[key] exists and is a string before calling includes
            const itemValue = item[key as keyof OxalateData];
            return (
              typeof itemValue === 'string' && itemValue.includes(filterValue)
            );
          }

          return true; // Handle any other types by not filtering
        });
      })
      .slice(0, 6); // Display first 6 items
  }

  // Convert Oxalate to OxalateData
  private convertToOxalateData(oxalate: Oxalate): OxalateData {
    return {
      category: oxalate.category,
      calc_level: oxalate.calc_level,
      level: parseFloat(oxalate.level) || 0, // Convert to number, default to 0
      item: oxalate.item,
      total_oxalate_mg_per_100g:
        parseFloat(oxalate.total_oxalate_mg_per_100g) || 0, // Convert to number, default to 0
      total_soluble_oxalate_mg_per_100g: parseFloat(
        oxalate.total_soluble_oxalate_mg_per_100g || '0'
      ), // Handle null and convert to number
      serving_size: oxalate.serving_size || '',
      serving_g: parseFloat(oxalate.serving_g || '0'), // Handle null and convert to number
    };
  }
}

 */
