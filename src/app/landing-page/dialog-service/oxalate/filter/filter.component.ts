import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { Filter } from './model/filter';
import { categories, calcLevels, levels } from './model/filter-data';
import { CategoryService } from '../service/category.service';
import { FilterService } from '../service/filter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent implements OnInit, OnDestroy {
  filters: Filter = {
    category: '',
    calc_level: '',
  };
  categories = categories;
  calcLevels = calcLevels;
  levels = levels;
  searchQuery: string = '';

  @Output() filterChanged = new EventEmitter<Filter>();
  private subscriptions: Subscription[] = [];

  constructor(
    private categoryService: CategoryService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.onCategoryChange();
    this.onFilterChange();
  }

  onCategoryChange() {
    this.subscriptions.push(
      this.categoryService.currentCategory$.subscribe((category) => {
        if (this.filters.category !== category) {
          this.filters.category = category ?? '';
          this.applyFilters();
        }
      })
    );
  }
  onFilterChange() {
    this.subscriptions.push(
      this.filterService.currentFilter$.subscribe((filter) => {
        this.filters = { ...filter };
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  applyFilters(): void {
    console.log('Applying filters:', this.filters);
    this.filterService.updateFilter(this.filters);
    this.filterChanged.emit(this.filters);
  }

  clearFilters(): void {
    this.filters = {
      category: '',
      calc_level: '',
    };

    this.filterService.clearAll();
    this.categoryService.clearAll();
    this.filterChanged.emit(this.filters);
  }
}
