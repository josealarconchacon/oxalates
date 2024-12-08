// pagination.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaginationService {
  private _itemsPerPage: number = 12;
  private _currentPage: number = 1;
  private _totalPages: number = 1;
  private _pagesToShow: number = 5;

  get itemsPerPage(): number {
    return this._itemsPerPage;
  }

  set itemsPerPage(value: number) {
    this._itemsPerPage = value;
  }

  get currentPage(): number {
    return this._currentPage;
  }

  set currentPage(value: number) {
    this._currentPage = value;
  }

  get totalPages(): number {
    return this._totalPages;
  }

  get pagesToShow(): number {
    return this._pagesToShow;
  }

  set pagesToShow(value: number) {
    this._pagesToShow = value;
  }

  getPages(totalItems: number): (number | string)[] {
    this._totalPages = Math.ceil(totalItems / this._itemsPerPage);
    const pages = [];
    const half = Math.floor(this._pagesToShow / 2);
    let start = Math.max(1, this._currentPage - half);
    let end = Math.min(this._totalPages, this._currentPage + half);

    if (this._currentPage - half < 1) {
      end = Math.min(this._totalPages, end + (half - this._currentPage + 1));
    }
    if (this._currentPage + half > this._totalPages) {
      start = Math.max(
        1,
        start - (this._currentPage + half - this._totalPages)
      );
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < this._totalPages) {
      if (end < this._totalPages - 1) {
        pages.push('...');
      }
      pages.push(this._totalPages);
    }

    return pages;
  }

  updateDisplayedItems<T>(items: T[]): T[] {
    const startIndex = (this._currentPage - 1) * this._itemsPerPage;
    const endIndex = startIndex + this._itemsPerPage;
    return items.slice(startIndex, endIndex);
  }

  changePage(page: number | string, totalItems: number): void {
    if (typeof page === 'number' && page >= 1 && page <= this._totalPages) {
      this._currentPage = page;
      this._totalPages = Math.ceil(totalItems / this._itemsPerPage);
    }
  }
}
