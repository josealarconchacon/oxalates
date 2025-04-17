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
  @ViewChild('searchInputElement') searchInputElement?: ElementRef;

  isDarkTheme: boolean = false;
  private themeSubscription: Subscription | null = null;

  constructor(
    private themeService: ThemeService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDarkTheme$.subscribe(
      (isDark) => {
        this.isDarkTheme = isDark;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  onSearchQueryChange(): void {
    this.searchQueryChange.emit(this.searchQuery);
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.searchQueryChange.emit(this.searchQuery);
    this.clearSearch.emit();
  }

  @HostListener('window:resize')
  onResize() {
    // Refocus input on resize to keep keyboard visible
    if (this.searchQuery) {
      this.focusInput();
    }
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
