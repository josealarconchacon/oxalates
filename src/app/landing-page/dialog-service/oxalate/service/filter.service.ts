import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Filter {
  category: string;
  calc_level: string;
}

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private currentFilterSubject = new BehaviorSubject<Filter>({
    category: '',
    calc_level: '',
  });
  public currentFilter$: Observable<Filter> =
    this.currentFilterSubject.asObservable();
  clearSearch$: any;

  updateFilter(filter: Partial<Filter>): void {
    const currentFilter = this.currentFilterSubject.value;
    this.currentFilterSubject.next({ ...currentFilter, ...filter });
  }

  getCurrentFilter(): Filter {
    return this.currentFilterSubject.value;
  }

  setCategory(category: string): void {
    this.currentFilterSubject.next({
      ...this.currentFilterSubject.value,
      category,
    });
  }

  clearAll(): void {
    this.currentFilterSubject.next({ category: '', calc_level: '' });
  }
}
