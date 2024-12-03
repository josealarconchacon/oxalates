import { Component, EventEmitter, Output } from '@angular/core';
import { Filter } from './model/filter';
import { categories, calcLevels, levels } from './model/filter-data';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent {
  filters: Filter = {
    category: '',
    calc_level: '',
  };

  searchQuery: string = '';

  @Output() filterChanged = new EventEmitter<Filter>();

  categories = categories;
  calcLevels = calcLevels;
  levels = levels;

  applyFilters(): void {
    console.log('Applying filters:', this.filters);
    this.filterChanged.emit(this.filters);
  }

  clearFilters(): void {
    this.filters = {
      category: '',
      calc_level: '',
    };
    this.searchQuery = '';
    console.log('Clearing filters and search query');
    this.filterChanged.emit(this.filters);
  }

  isFilterMenuActive = false;
  activeSection: string | null = null;

  toggleFilterMenu() {
    this.isFilterMenuActive = !this.isFilterMenuActive;
  }

  isSectionActive(section: string): boolean {
    return this.activeSection === section;
  }

  toggleSection(section: string): void {
    this.activeSection = this.activeSection === section ? null : section;
  }
}
