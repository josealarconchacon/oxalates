import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import {
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators';
import { Oxalate } from '../../model/oxalate';

@Injectable({
  providedIn: 'root',
})
export class OxalateService {
  private dataUrl = 'assets/mock-oxalate/oxolateListData.json';
  private searchTerms = new Subject<string>();

  constructor(private http: HttpClient) {}

  getOxalateData(): Observable<Oxalate[]> {
    return this.http.get<Oxalate[]>(this.dataUrl);
  }

  searchOxalateData(query: string): Observable<Oxalate[]> {
    return this.getOxalateData().pipe(
      map((data) => {
        if (query && typeof query === 'string' && query.trim() !== '') {
          const searchResults: Oxalate[] = [];
          for (const item of data) {
            // Perform a case-insensitive search for the query within each property of the item
            for (const key of Object.keys(item)) {
              const propertyValue = item[key as keyof Oxalate]; // Explicitly define the type of the property value
              if (
                typeof propertyValue === 'string' &&
                propertyValue.toLowerCase().includes(query.trim().toLowerCase())
              ) {
                searchResults.push(item);
                break; // Add the item once and move to the next item
              }
            }
          }
          return searchResults;
        } else {
          return data; // Return the original data if the search query is empty
        }
      })
    );
  }

  initiateDynamicSearch(): void {
    this.searchTerms
      .pipe(
        debounceTime(300), // Debounce user input for 300ms
        distinctUntilChanged(), // Ensure the search term has changed
        switchMap((query: string) => this.searchOxalateData(query))
      )
      .subscribe((data) => {
        // Update the displayed items based on search results
        // For example: this.displayedOxalates = data;
      });
  }

  updateSearchQuery(query: string): void {
    this.searchTerms.next(query); // Emit the search term to trigger the dynamic search
  }

  // OxalateService.ts
  getOxalateById(id: string): Observable<Oxalate | undefined> {
    return this.getOxalateData().pipe(
      map((oxalates) => oxalates.find((oxalate) => oxalate.id === id))
    );
  }
}
