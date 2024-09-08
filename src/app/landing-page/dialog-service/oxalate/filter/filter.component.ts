import { Component, EventEmitter, Output } from '@angular/core';
import { Filter } from './model/filter';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent {
  filters: Filter = {};

  @Output() filterChanged = new EventEmitter<Filter>();

  applyFilters(): void {
    console.log('Applying filters:', this.filters); // Log filters being applied
    this.filterChanged.emit(this.filters);
  }

  clearFilters(): void {
    this.filters = {}; // Reset filters
    console.log('Clearing filters'); // Log when filters are cleared
    this.filterChanged.emit(this.filters); // Emit empty filters
  }
  isFilterMenuActive = false;

  toggleFilterMenu() {
    this.isFilterMenuActive = !this.isFilterMenuActive;
  }
  activeSection: string | null = null;
  isSectionActive(section: string): boolean {
    // Replace this with your own logic for determining if the section is active
    return this.activeSection === section;
  }
  toggleSection(section: string): void {
    this.activeSection = this.activeSection === section ? null : section;
  }
}
