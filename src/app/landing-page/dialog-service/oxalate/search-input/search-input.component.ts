import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ThemeService } from 'src/app/shared/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.css'],
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() searchQuery: string = '';
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();
  /** The person asked for results: pressed Enter or the Search button. */
  @Output() searchSubmitted = new EventEmitter<void>();
  @ViewChild('searchInputElement') searchInputElement?: ElementRef;

  isDarkTheme: boolean = false;
  private themeSubscription: Subscription | null = null;
  private isDoneKeyPressed: boolean = false;

  constructor(
    private themeService: ThemeService,
    private elementRef: ElementRef,
  ) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkTheme$.subscribe(
      (isDark) => {
        this.isDarkTheme = isDark;
      },
    );
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  get hasSearchQuery(): boolean {
    return !!this.searchQuery?.trim();
  }

  onSearchQueryChange(value: string): void {
    this.searchQuery = value;
    this.searchQueryChange.emit(this.searchQuery);
  }

  onClearSearch(): void {
    if (!this.hasSearchQuery) {
      return;
    }

    this.searchQuery = '';
    this.searchQueryChange.emit(this.searchQuery);
    this.clearSearch.emit();
  }

  onClearClick(): void {
    this.onClearSearch();
    this.focusInput();
  }

  /** Enter in the field or the Search button. Nothing to search for means nothing happens. */
  onSubmit(event?: Event): void {
    event?.preventDefault();
    if (!this.hasSearchQuery) {
      this.focusInput();
      return;
    }
    // Lets the keyboard stay dismissed on a phone instead of resize re-focusing the field
    this.isDoneKeyPressed = true;
    this.searchSubmitted.emit();
  }

  @HostListener('window:resize')
  onResize() {
    // Refocus input on resize to keep keyboard visible
    if (this.hasSearchQuery && !this.isDoneKeyPressed) {
      this.focusInput();
    }
  }

  /**
   * Only forgets that the field was submitted. It used to pull focus back into the
   * field on phones, which trapped people in it: tapping Clear, a result or the
   * page behind it all bounced the keyboard back up.
   */
  onBlur(): void {
    this.isDoneKeyPressed = false;
  }

  /**
   * Public method to focus the input element
   */
  focusInput(): void {
    // First try to use ViewChild reference
    if (this.searchInputElement) {
      this.searchInputElement.nativeElement.focus();
      // Ensure keyboard stays visible on mobile
      this.searchInputElement.nativeElement.click();
    } else {
      // Otherwise look for input in the component
      const inputElement = this.elementRef.nativeElement.querySelector('input');
      if (inputElement) {
        inputElement.focus();
        // Ensure keyboard stays visible on mobile
        inputElement.click();
      }
    }
  }
}
