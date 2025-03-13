import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
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

  isDarkTheme: boolean = false;
  private themeSubscription: Subscription | null = null;

  constructor(private themeService: ThemeService) {}

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
}
