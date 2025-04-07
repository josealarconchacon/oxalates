import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService } from '../shared/services/theme.service';
import { OxalateService } from './dialog-service/service/oxalate.service';
import { Oxalate } from './model/oxalate';
import { Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit, OnDestroy {
  isDarkTheme$ = this.themeService.isDarkTheme$;
  searchQuery: string = '';
  showSearchResults: boolean = false;
  searchResults: Oxalate[] = [];
  isLoading: boolean = false;
  private searchSubject: Subject<string> = new Subject<string>();
  private subscriptions: Subscription[] = [];
  private lastQuery: string = '';

  constructor(
    private themeService: ThemeService,
    private oxalateService: OxalateService
  ) {}

  ngOnInit() {
    this.setupSearchSubscription();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private setupSearchSubscription(): void {
    this.subscriptions.push(
      this.searchSubject
        .pipe(
          tap(() => {
            if (this.searchQuery.trim() !== this.lastQuery) {
              this.isLoading = true;
            }
          }),
          debounceTime(100),
          distinctUntilChanged(),
          switchMap((query) => {
            this.lastQuery = query.trim();
            return this.oxalateService.searchOxalateData(query);
          })
        )
        .subscribe({
          next: (data) => {
            this.searchResults = data;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error searching oxalates:', error);
            this.isLoading = false;
          },
        })
    );
  }

  onRegister() {
    console.log('Register button clicked');
  }

  scrollToOxalate() {
    setTimeout(() => {
      const element = document.querySelector('app-oxalate');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  }

  onSearchQueryChange(query: string) {
    this.searchQuery = query;
    if (!this.showSearchResults) {
      this.showSearchResults = true;
    }

    if (!query.trim()) {
      this.searchResults = [];
      this.isLoading = false;
      this.lastQuery = '';
    }

    this.searchSubject.next(query);
  }

  onClearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.isLoading = false;
    this.lastQuery = '';
    this.searchSubject.next('');
  }

  closeSearchResults() {
    this.showSearchResults = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.lastQuery = '';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
