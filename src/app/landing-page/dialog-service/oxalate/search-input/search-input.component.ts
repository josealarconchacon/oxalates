import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, BrowserModule],
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.css'],
})
export class SearchInputComponent {
  @Output() searchQueryChange = new EventEmitter<string>();
  searchQuery: string = '';

  onSearchQueryChange(): void {
    this.searchQueryChange.emit(this.searchQuery);
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.searchQueryChange.emit(this.searchQuery);
  }
}
