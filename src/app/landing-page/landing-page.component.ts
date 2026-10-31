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
import { Router, ActivatedRoute } from '@angular/router';
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
  @ViewChild('mainSearchInput') mainSearchInput?: SearchInputComponent;
  @ViewChild('modalContainer') modalContainer?: ElementRef<HTMLElement>;

  isDarkTheme$ = this.themeService.isDarkTheme$;
  searchQuery: string = '';
  showSearchResults: boolean = false;
  searchResults: Oxalate[] = [];
  isLoading: boolean = false;
  showOxalateComponent: boolean = false;

  /** What the screen-reader live region says about the search. */
  get searchStatus(): string {
    const query = this.searchQuery.trim();
    if (this.isLoading) {
      return 'Searching.';
    }
    if (!query) {
      return '';
    }
    const count = this.searchResults.length;
    if (count === 0) {
      return `No results found for ${query}.`;
    }
    return `${count} ${count === 1 ? 'result' : 'results'} found for ${query}.`;
  }
  private searchSubject: Subject<string> = new Subject<string>();
  private subscriptions: Subscription[] = [];
  private lastQuery: string = '';
  private pendingFocus: boolean = false;
  /** Results open by themselves once the query is this long. */
  private readonly MIN_AUTO_SEARCH_LENGTH = 3;
  /** The results were opened with Enter or the Search button, so a short query keeps them open. */
  private openedBySubmit = false;

  private readonly FOCUSABLE_SELECTORS =
    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), ' +
    'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  constructor(
    private themeService: ThemeService,
    private oxalateService: OxalateService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.setupSearchSubscription();
    this.checkQueryParams();
  }

  private checkQueryParams() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.showOxalateComponent = params['showOxalate'] === 'true';
    });
  }

  ngAfterViewChecked() {
    if (this.pendingFocus && this.modalSearchInput) {
      this.focusModalSearchInput();
      this.pendingFocus = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showSearchResults) {
      this.closeSearchResults();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onFocusTrapKeyDown(event: KeyboardEvent): void {
    if (!this.showSearchResults || event.key !== 'Tab') return;
    const modal = this.modalContainer?.nativeElement;
    if (!modal) return;

    const focusable = Array.from(
      modal.querySelectorAll<HTMLElement>(this.FOCUSABLE_SELECTORS)
    ).filter((el) => !el.closest('[aria-hidden="true"]'));

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || active === modal) {
        last.focus();
        event.preventDefault();
      }
    } else {
      if (active === last) {
        first.focus();
        event.preventDefault();
      }
    }
  }

  private setSearchResultsVisible(visible: boolean): void {
    this.showSearchResults = visible;
    if (!visible) {
      this.openedBySubmit = false;
    }
    document.body.style.overflow = visible ? 'hidden' : '';
  }

  // Used when the modal is deliberately dismissed (Escape, backdrop click,
  // close button, Clear) so focus doesn't get dropped onto <body> once the
  // modal's own search input is removed from the DOM. Not used for the
  // auto-hide-while-typing case, where stealing focus would be disruptive.
  private closeAndRestoreFocus(): void {
    this.setSearchResultsVisible(false);
    setTimeout(() => this.mainSearchInput?.focusInput(), 0);
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

  onSearchQueryChange(query: string) {
    this.searchQuery = query;

    // Same behavior for mobile and desktop: the results open on their own from
    // MIN_AUTO_SEARCH_LENGTH characters. A shorter query opens them only on Enter or Search.
    const length = query.trim().length;
    if (length >= this.MIN_AUTO_SEARCH_LENGTH && !this.showSearchResults) {
      this.setSearchResultsVisible(true);
      this.pendingFocus = true;
    } else if (
      length === 0 ||
      (length < this.MIN_AUTO_SEARCH_LENGTH && !this.openedBySubmit)
    ) {
      this.setSearchResultsVisible(false);
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
   * Enter or the Search button: show the results now, however short the query.
   * Already open (the query was long enough) means the results are on screen, so nothing to do.
   */
  onSearchSubmitted() {
    if (!this.searchQuery.trim() || this.showSearchResults) {
      return;
    }
    this.openedBySubmit = true;
    this.setSearchResultsVisible(true);
    this.pendingFocus = true;
  }

  onClearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.isLoading = false;
    this.lastQuery = '';
    this.closeAndRestoreFocus();
    this.searchSubject.next('');
  }

  closeSearchResults() {
    this.closeAndRestoreFocus();
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
