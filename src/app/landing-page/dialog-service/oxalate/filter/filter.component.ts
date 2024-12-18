import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Filter } from './model/filter';
import { categories, calcLevels, levels } from './model/filter-data';
import { CategoryService } from '../service/category.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent implements OnInit {
  filters: Filter = {
    category: '',
    calc_level: '',
  };

  searchQuery: string = '';

  @Output() filterChanged = new EventEmitter<Filter>();

  categories = categories;
  calcLevels = calcLevels;
  levels = levels;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.currentCategory.subscribe((category) => {
      this.filters.category = category;
      this.applyFilters();
    });
  }

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
