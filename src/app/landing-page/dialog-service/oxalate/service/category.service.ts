import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private categorySubject = new BehaviorSubject<string>('');
  private searchQuerySubject = new BehaviorSubject<string>('');

  currentCategory = this.categorySubject.asObservable();
  currentSearchQuery = this.searchQuerySubject.asObservable();

  changeCategory(category: string) {
    this.categorySubject.next(category);
    this.changeSearchQuery(category); // Set search query to the category
  }

  changeSearchQuery(searchQuery: string) {
    this.searchQuerySubject.next(searchQuery);
  }
  clearCategory() {
    this.categorySubject.next('');
    this.searchQuerySubject.next('');
  }
}
