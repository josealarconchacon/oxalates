import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  HostListener,
} from '@angular/core';
import { ThemeService } from '../shared/services/theme.service';
import { OxalateService } from './dialog-service/service/oxalate.service';
import { Oxalate } from './model/oxalate';
import { Subject, Subscription, of } from 'rxjs';
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
  private isMobile: boolean = false;

  constructor(
    private themeService: ThemeService,
    private oxalateService: OxalateService,
    private router: Router
  ) {
    this.checkMobileDevice();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobileDevice();
  }

  private checkMobileDevice() {
    this.isMobile = window.innerWidth <= 768;
  }

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
            if (
              this.searchQuery.trim() !== this.lastQuery &&
              this.searchQuery.trim() !== ''
            ) {
              this.isLoading = true;
            }
          }),
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((query) => {
            this.lastQuery = query.trim();
            if (!query.trim()) {
              return of([]);
            }
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

    // For mobile devices, only show modal after 4 characters
    if (this.isMobile) {
      if (query.length >= 4 && !this.showSearchResults) {
        this.showSearchResults = true;
        this.pendingFocus = true;
      } else if (query.length < 4) {
        this.showSearchResults = false;
      }
    } else {
      // Desktop behavior remains the same
      if (!this.showSearchResults) {
        this.showSearchResults = true;
        this.pendingFocus = true;
      }
    }

    if (!query.trim()) {
      this.searchResults = [];
      this.isLoading = false;
      this.lastQuery = '';
    } else {
      if (query.trim() !== this.lastQuery) {
        this.searchSubject.next(query);
      }
    }
  }

  /**
   * Handle Enter key press to dismiss keyboard on mobile
   */
  onSearchEnterPressed() {
    if (this.isMobile) {
      // On mobile, when Done key is pressed, we want to keep the modal open
      // but allow the keyboard to be dismissed
      this.pendingFocus = false;
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
    // Navigate to oxalate details page with more parameters
    this.router.navigate(['/oxalate'], {
      queryParams: {
        search: oxalate.item,
        category: oxalate.category,
        level: oxalate.level || oxalate.calc_level,
        autoOpenDetails: 'true',
        itemId: oxalate.id,
        searchPreserved: 'true',
      },
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
