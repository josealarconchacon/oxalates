import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, from, of, BehaviorSubject } from 'rxjs';
import Fuse from 'fuse.js';
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
  private cachedData: Oxalate[] = [];
  private dataLoaded = false;
  private searchCache = new Map<string, Oxalate[]>();
  private readonly MAX_CACHE_SIZE = 100;

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {
    // Preload data when service is initialized
    this.preloadData();
  }

  private preloadData(): void {
    if (!this.dataLoaded) {
      this.http
        .get<Oxalate[]>(this.dataUrl)
        .pipe(
          tap((data) => {
            this.cachedData = data;
            this.dataLoaded = true;
          }),
          catchError((error) => {
            console.error('Error loading data:', error);
            return of([]);
          })
        )
        .subscribe();
    }
  }

  getOxalateData(): Observable<Oxalate[]> {
    return this.http.get<Oxalate[]>(this.dataUrl);
  }

  searchOxalateData(query: string): Observable<Oxalate[]> {
    // If query is empty, return empty results immediately
    if (!query.trim()) {
      return of([]);
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    if (this.searchCache.has(cacheKey)) {
      return of(this.searchCache.get(cacheKey) || []);
    }

    // If data is already loaded, search in memory
    if (this.dataLoaded) {
      const results = this.performLocalSearch(query);
      this.updateSearchCache(cacheKey, results);
      return of(results);
    }

    // If data isn't loaded yet, load it and search
    return this.http.get<Oxalate[]>(this.dataUrl).pipe(
      tap((data) => {
        this.cachedData = data;
        this.dataLoaded = true;
      }),
      map((data) => {
        const results = this.performLocalSearch(query);
        this.updateSearchCache(cacheKey, results);
        return results;
      }),
      catchError((error) => {
        console.error('Error searching oxalates:', error);
        return of([]);
      })
    );
  }

  private performLocalSearch(query: string): Oxalate[] {
    if (!query || query.trim() === '') {
      return [];
    }

    const preprocessQuery = (q: string): string =>
      q
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .trim();

    const processedQuery = preprocessQuery(query);

    const fuse = new Fuse(this.cachedData, {
      keys: [
        { name: 'item', weight: 0.7 },
        { name: 'category', weight: 0.3 },
        'notes',
      ],
      threshold: 0.3,
      ignoreLocation: true,
      includeScore: true,
      findAllMatches: true,
      useExtendedSearch: true,
    });

    const searchResults = fuse.search(processedQuery);

    return searchResults
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .map((result) => result.item)
      .slice(0, 50); // Keep the limit for performance
  }

  private updateSearchCache(key: string, results: Oxalate[]): void {
    if (this.searchCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.searchCache.keys().next().value;
      if (firstKey !== undefined) {
        this.searchCache.delete(firstKey);
      }
    }
    this.searchCache.set(key, results);
  }

  initiateDynamicSearch(): void {
    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query: string) => this.searchOxalateData(query))
      )
      .subscribe((data) => {});
  }

  updateSearchQuery(query: string): void {
    this.searchTerms.next(query);
  }

  getOxalateById(id: string): Observable<Oxalate | undefined> {
    return this.getOxalateData().pipe(
      map((oxalates) => oxalates.find((oxalate) => oxalate.id === id))
    );
  }

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

    const docRef = await userDocRef
      .collection('oxalates')
      .add({ ...oxalateData });
    // console.log('Oxalate saved with ID:', docRef.id);
    console.log('Oxalate saved with ID:', '...');
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
    console.log('Attempting to delete document with ID: ...');
    // console.log('Attempting to delete document with ID:', id);

    try {
      const snapshot = await docRef.get().toPromise();
      if (!snapshot || !snapshot.exists) {
        throw new Error(
          `Document with ID ${id} for user ${userId} does not exist`
        );
      }

      await docRef.delete();
      // console.log(`Oxalate with ID ${id} deleted successfully`);
      console.log(`Oxalate with ID ${'...'} deleted successfully`);
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
        if (!oxalatesSnapshot || oxalatesSnapshot.empty) {
          console.warn('No oxalates found or the snapshot is undefined');
          return [];
        }
        return oxalatesSnapshot.docs.map((doc) => {
          const data = doc.data() as Oxalate;
          return {
            ...data,
            id: doc.id,
          };
        });
      })
    );
  }
}
