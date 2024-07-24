import { Component, EventEmitter, Output } from '@angular/core';
import { Filter } from './model/filter';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
// export class FilterComponent {}
export class FilterComponent {
  filters: Filter = {};

  @Output() filterChanged = new EventEmitter<Filter>();

  applyFilters(): void {
    this.filterChanged.emit(this.filters);
  }
}
