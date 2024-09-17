import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, from, of } from 'rxjs';
import {
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { Oxalate } from '../../model/oxalate';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import {
  AngularFirestore,
  DocumentData,
  DocumentReference,
} from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class OxalateService {
  private dataUrl = 'assets/mock-oxalate/oxolateListData.json';
  private searchTerms = new Subject<string>();
  private collectionName = 'savedOxalates';

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

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

  getOxalateById(id: string): Observable<Oxalate | undefined> {
    return this.getOxalateData().pipe(
      map((oxalates) => oxalates.find((oxalate) => oxalate.id === id))
    );
  }

  async saveOxalate(oxalateData: Oxalate): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use `doc` to specify a document ID if necessary, or use auto-generated ID
      const docRef = this.firestore
        .collection(this.collectionName)
        .doc(user.uid)
        .collection('oxalates')
        .doc(); // Creates a new document with auto-generated ID

      await docRef.set({ ...oxalateData, userId: user.uid });
      console.log('Oxalate saved successfully');
    } catch (error) {
      console.error('Error saving oxalate:', error);
      throw error;
    }
  }

  // Retrieves all saved oxalates from Firestore.
  getSavedOxalates(): Observable<Oxalate[]> {
    return from(this.authService.getCurrentUser()).pipe(
      switchMap((user) => {
        if (user) {
          return this.firestore
            .collection(this.collectionName)
            .doc(user.uid)
            .collection('oxalates')
            .valueChanges() as Observable<Oxalate[]>;
        } else {
          return of([]); // Return an empty array if no user is authenticated
        }
      }),
      catchError((error) => {
        console.error('Error fetching saved oxalates:', error);
        return of([]); // Return an empty array in case of error
      })
    );
  }
}
