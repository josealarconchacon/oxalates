import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  OnInit,
  ViewChild,
} from '@angular/core';
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

  @ViewChild('main', { static: true }) main!: ElementRef<HTMLElement>;

  searchTerm: string = '';
  @Output() searchEvent = new EventEmitter<string>();

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.isDarkTheme$.subscribe((isDark) => {
      this.isDarkTheme = isDark;
      document.body.classList.toggle('dark-theme', isDark);
    });
  }

  /**
   * A plain href="#main" would make the router navigate to the same URL with
   * a fragment, and nothing would move. Focus <main> directly instead.
   */
  skipToMain(event: Event): void {
    event.preventDefault();
    this.main.nativeElement.focus();
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
