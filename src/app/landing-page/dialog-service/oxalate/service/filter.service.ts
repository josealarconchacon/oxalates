import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Filter } from '../filter/model/filter';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private filterSubject = new BehaviorSubject<Filter>({
    category: '',
    calc_level: '',
  });
  currentFilter$ = this.filterSubject.asObservable();

  private clearSearchSubject = new Subject<void>();
  clearSearch$ = this.clearSearchSubject.asObservable();

  constructor(private categoryService: CategoryService) {}

  updateFilter(filter: Filter): void {
    this.filterSubject.next(filter);
  }
  clearAll(): void {
    this.filterSubject.next({
      category: '',
      calc_level: '',
    });
    this.clearSearchSubject.next();
    this.categoryService.clearCategory();
  }
}
