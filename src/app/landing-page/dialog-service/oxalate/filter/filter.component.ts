import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { Filter } from './model/filter';
import { categories, calcLevels, levels } from './model/filter-data';
import { CategoryService } from '../service/category.service';
import { FilterService } from '../service/filter.service';

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
  categories = categories;
  calcLevels = calcLevels;
  levels = levels;
  searchQuery: string = '';

  @Output() filterChanged = new EventEmitter<Filter>();

  constructor(
    private categoryService: CategoryService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.categoryService.currentCategory.subscribe((category) => {
      this.filters.category = category;
      if (category) {
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    console.log('Applying filters:', this.filters); // Log the filters
    this.filterService.updateFilter(this.filters);
    this.filterChanged.emit(this.filters);
  }

  clearFilters(): void {
    this.filters = {
      category: '',
      calc_level: '',
    };
    // Reset dropdowns to default values
    const categorySelect = document.querySelector(
      'select[name="time"]'
    ) as HTMLSelectElement;
    const calcLevelSelect = document.querySelector(
      'select[name="results"]'
    ) as HTMLSelectElement;

    if (categorySelect) categorySelect.selectedIndex = 0;
    if (calcLevelSelect) calcLevelSelect.selectedIndex = 0;

    this.filterService.clearAll();
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
