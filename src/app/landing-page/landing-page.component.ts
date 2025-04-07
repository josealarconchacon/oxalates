import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
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
import { Router } from '@angular/router';
import { SearchInputComponent } from './dialog-service/oxalate/search-input/search-input.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  @ViewChild('modalSearchInput') modalSearchInput!: SearchInputComponent;

  isDarkTheme$ = this.themeService.isDarkTheme$;
  searchQuery: string = '';
  showSearchResults: boolean = false;
  searchResults: Oxalate[] = [];
  isLoading: boolean = false;
  private searchSubject: Subject<string> = new Subject<string>();
  private subscriptions: Subscription[] = [];
  private lastQuery: string = '';
  private pendingFocus: boolean = false;

  constructor(
    private themeService: ThemeService,
    private oxalateService: OxalateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupSearchSubscription();
  }

  ngAfterViewChecked() {
    if (this.pendingFocus && this.modalSearchInput) {
      this.focusModalSearchInput();
      this.pendingFocus = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private focusModalSearchInput() {
    // Use the public method on the search input component to focus the input
    if (this.modalSearchInput) {
      setTimeout(() => {
        this.modalSearchInput.focusInput();
      }, 0);
    }
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
            if (this.showSearchResults) {
              this.pendingFocus = true;
            }
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
    if (!this.showSearchResults && query.trim()) {
      this.showSearchResults = true;
      this.pendingFocus = true;
    }

    if (!query.trim()) {
      this.searchResults = [];
      this.isLoading = false;
      this.lastQuery = '';
      this.showSearchResults = false;
    } else {
      this.searchSubject.next(query);
    }
  }

  onClearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.isLoading = false;
    this.lastQuery = '';
    this.showSearchResults = false;
    this.searchSubject.next('');
  }

  closeSearchResults() {
    this.showSearchResults = false;
  }

  viewOxalateDetails(oxalate: Oxalate) {
    // Navigate to oxalate details page or open modal with details
    // One option is to navigate to the oxalate page with the selected item
    this.router.navigate(['/oxalate'], {
      queryParams: { search: oxalate.item },
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
