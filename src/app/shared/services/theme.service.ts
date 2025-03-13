import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor() {
    // Check if there's a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkTheme.next(savedTheme === 'dark');
      this.applyTheme(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      this.isDarkTheme.next(prefersDark);
      this.applyTheme(prefersDark);
    }
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkTheme.value;
    this.isDarkTheme.next(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean): void {
    document.documentElement.classList.toggle('dark-theme', isDark);
  }
}
