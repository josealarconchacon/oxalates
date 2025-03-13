import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'oxalates';
  isDarkTheme = false;

  searchTerm: string = '';
  @Output() searchEvent = new EventEmitter<string>();

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.isDarkTheme$.subscribe((isDark) => {
      this.isDarkTheme = isDark;
      document.body.classList.toggle('dark-theme', isDark);
    });
  }

  search() {
    this.searchEvent.emit(this.searchTerm);
  }

  clear() {
    this.searchTerm = '';
    this.search();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
