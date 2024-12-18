import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Filter } from '../filter/model/filter';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private filterSubject = new BehaviorSubject<Filter>({
    category: '',
    calc_level: '',
  });
  currentFilter$ = this.filterSubject.asObservable();

  updateFilter(filter: Filter): void {
    this.filterSubject.next(filter);
  }
}
