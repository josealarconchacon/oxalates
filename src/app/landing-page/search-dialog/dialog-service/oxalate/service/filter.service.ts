import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Filter } from '../filter/model/filter';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private filterSubject = new BehaviorSubject<Filter>({});
  currentFilter$: Observable<Filter> = this.filterSubject.asObservable();

  updateFilter(filter: Filter): void {
    this.filterSubject.next(filter);
  }
}
