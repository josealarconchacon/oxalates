import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private currentCategorySubject = new BehaviorSubject<string | null>(null);
  public currentCategory$: Observable<string | null> =
    this.currentCategorySubject.asObservable();

  changeCategory(category: string): void {
    this.currentCategorySubject.next(category);
  }

  clearAll(): void {
    this.currentCategorySubject.next(null);
  }
}
