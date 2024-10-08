import firebase from 'firebase/compat/app';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, from, of } from 'rxjs';
import {
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  tap,
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
            // case-insensitive search for the query within each property of the item
            for (const key of Object.keys(item)) {
              const propertyValue = item[key as keyof Oxalate];
              if (
                typeof propertyValue === 'string' &&
                propertyValue.toLowerCase().includes(query.trim().toLowerCase())
              ) {
                searchResults.push(item);
                break;
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
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query: string) => this.searchOxalateData(query))
      )
      .subscribe((data) => {
        // Update the displayed items based on search results
        // For example: this.displayedOxalates = data;
      });
  }

  updateSearchQuery(query: string): void {
    this.searchTerms.next(query);
  }

  getOxalateById(id: string): Observable<Oxalate | undefined> {
    return this.getOxalateData().pipe(
      map((oxalates) => oxalates.find((oxalate) => oxalate.id === id))
    );
  }

  // Retrieves all saved oxalates from Firestore.
  private async getCurrentUser(): Promise<any> {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  }
  async itemExists(oxalateData: Oxalate, userId: string): Promise<boolean> {
    const existingItems = await this.firestore
      .collection(this.collectionName)
      .doc(userId)
      .collection('oxalates')
      .ref.get();

    return existingItems.docs.some((doc) => {
      const data = doc.data() as Oxalate;
      return data.item === oxalateData.item;
    });
  }

  private async saveNewItem(
    oxalateData: Oxalate,
    userId: string
  ): Promise<void> {
    const userDocRef = this.firestore
      .collection(this.collectionName)
      .doc(userId);

    // Save the document and get the document reference (which contains the generated ID)
    const docRef = await userDocRef
      .collection('oxalates')
      .add({ ...oxalateData });
    console.log('Oxalate saved with ID:', docRef.id);
  }

  async saveOxalate(oxalateData: Oxalate): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      const userId = user.uid;

      const exists = await this.itemExists(oxalateData, userId);
      if (exists) {
        console.log('Item already saved!');
        return;
      }

      await this.saveNewItem(oxalateData, userId);
      console.log('Oxalate saved successfully');
    } catch (error) {
      console.error('Error saving oxalate:', error);
      throw error;
    }
  }

  async deleteOxalate(userId: string, id: string): Promise<void> {
    const docRef = this.firestore
      .collection(this.collectionName)
      .doc(userId)
      .collection('oxalates')
      .doc(id);

    console.log('Attempting to delete document with ID:', id);

    try {
      const snapshot = await docRef.get().toPromise();
      if (!snapshot || !snapshot.exists) {
        throw new Error(
          `Document with ID ${id} for user ${userId} does not exist`
        );
      }

      await docRef.delete();
      console.log(`Oxalate with ID ${id} deleted successfully`);
    } catch (error) {
      console.error('Error deleting oxalate:', error);
      throw error;
    }
  }

  getSavedOxalates(userId: string): Observable<Oxalate[]> {
    const oxalatesRef = this.firestore
      .collection(this.collectionName)
      .doc(userId)
      .collection('oxalates')
      .get();

    return from(oxalatesRef).pipe(
      map((oxalatesSnapshot) => {
        // Check if oxalatesSnapshot is undefined or empty
        if (!oxalatesSnapshot || oxalatesSnapshot.empty) {
          console.warn('No oxalates found or the snapshot is undefined');
          return [];
        }
        return oxalatesSnapshot.docs.map((doc) => {
          const data = doc.data() as Oxalate; // Type assertion to Oxalate
          return {
            ...data,
            id: doc.id,
          };
        });
      })
    );
  }
}
