import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkTheme.asObservable();

  /** True until the visitor picks a theme; until then the OS setting decides. */
  private followingSystem: boolean;

  constructor() {
    const saved = this.readSavedTheme();
    this.followingSystem = saved === null;

    const isDark = saved ? saved === 'dark' : this.systemPrefersDark();
    this.isDarkTheme.next(isDark);
    this.applyTheme(isDark);

    if (this.followingSystem) {
      window.matchMedia?.(DARK_QUERY)?.addEventListener?.('change', (event) => {
        if (this.followingSystem) {
          this.isDarkTheme.next(event.matches);
          this.applyTheme(event.matches);
        }
      });
    }
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkTheme.value;
    this.followingSystem = false;
    this.isDarkTheme.next(newTheme);
    this.applyTheme(newTheme);
    this.saveTheme(newTheme ? 'dark' : 'light');
  }

  /** Only an explicit 'dark' or 'light' counts as a choice; anything else defers to the OS. */
  private readSavedTheme(): 'dark' | 'light' | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'dark' || saved === 'light' ? saved : null;
    } catch {
      // Storage can be blocked (private windows, strict privacy settings).
      return null;
    }
  }

  private saveTheme(theme: 'dark' | 'light'): void {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // The theme still applies for this visit; it just won't be remembered.
    }
  }

  private systemPrefersDark(): boolean {
    return window.matchMedia?.(DARK_QUERY)?.matches ?? false;
  }

  private applyTheme(isDark: boolean): void {
    document.documentElement.classList.toggle('dark-theme', isDark);
  }
}
