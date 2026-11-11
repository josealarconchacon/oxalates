import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { NavigationService } from 'src/app/user-auth/service/navigation.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../shared/services/theme.service';
import { AuthMessageService } from '../../shared/services/auth-message.service';
import { ClickableDirective } from '../../shared/directives/clickable.directive';
import { showDefaultAvatar } from '../../shared/utils/avatar';
import { ProfileImageService } from '../../user-auth/service/profile-image.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

/** Things Tab can land on inside the slide-out menu. */
const MENU_FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Below 860px the text links move into the slide-out menu. */
export const HEADER_MOBILE_QUERY = '(max-width: 859.98px)';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [
    CommonModule,
    RouterLink,
    ClickableDirective,
    IconComponent,
  ],
})
export class HeaderComponent implements OnInit {
  isNavOpen = false;
  isLoggedIn = false;
  userProfile: any;
  isScrolled = false;
  isMobileMenuOpen = false;
  userImage: string | null = null;
  userName: string | null = null;

  activeSection$: Observable<string>;
  isMobile$: Observable<boolean>;
  isDarkTheme$ = this.themeService.isDarkTheme$;

  @ViewChild('menuButton') menuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButton') closeButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('navPanel') navPanel?: ElementRef<HTMLElement>;

  private scrollThreshold = 50;
  private lastScrollPosition = 0;
  private scrollTimer: any;
  private rafId: number | null = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private navigationService: NavigationService,
    private breakpointObserver: BreakpointObserver,
    private themeService: ThemeService,
    private authMessageService: AuthMessageService,
    private profileImageService: ProfileImageService
  ) {
    this.activeSection$ = this.navigationService.activeSection$;
    // Must match the max-width in header.component.css.
    this.isMobile$ = this.breakpointObserver
      .observe(HEADER_MOBILE_QUERY)
      .pipe(map((result) => result.matches));
  }

  ngOnInit(): void {
    this.authService.userProfile$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.userProfile = user;
    });

    // Initialize user data from your auth service
    this.initializeUserData();
  }

  ngOnDestroy(): void {
    // Clean up requestAnimationFrame to prevent memory leaks
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
    if (this.isNavOpen) {
      // Wait a frame for the drawer to become visible, then move focus in.
      requestAnimationFrame(() => this.closeButton?.nativeElement.focus());
    }
  }

  /** Escape closes the slide-out menu and returns focus to the menu button. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isNavOpen) return;
    this.closeNav();
    this.menuButton?.nativeElement.focus();
  }

  /**
   * Focus trap: while the menu covers the page, Tab and Shift+Tab cycle
   * through the menu's own items instead of reaching the hidden page behind.
   */
  @HostListener('document:keydown', ['$event'])
  onMenuTab(event: KeyboardEvent): void {
    const panel = this.navPanel?.nativeElement;
    if (!this.isNavOpen || event.key !== 'Tab' || !panel) return;

    const items = Array.from(
      panel.querySelectorAll<HTMLElement>(MENU_FOCUSABLE)
    ).filter((el) => el.getClientRects().length > 0); // skip hidden ones
    if (items.length === 0) return;

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement as HTMLElement | null;
    const outside = !active || !panel.contains(active);

    if (event.shiftKey && (active === first || outside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || outside)) {
      event.preventDefault();
      first.focus();
    }
  }

  closeNav(): void {
    this.isNavOpen = false;
  }

  goToLandingPage() {
    this.router.navigate(['/'], { queryParams: { scrollTo: 'top' } });
  }

  goToLoginPage() {
    this.router.navigate(['/auth']);
  }

  goToProfile() {
    if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/auth']);
    }
    this.closeNav();
  }

  search() {
    this.router.navigate(['/oxalate']);
  }

  goToSupport() {
    this.router.navigate(['/contribution']);
    this.closeNav();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    // Use requestAnimationFrame for better performance
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    this.rafId = requestAnimationFrame(() => {
      const currentScroll = window.scrollY;

      // Only update if there's a significant change to avoid unnecessary updates
      if (Math.abs(currentScroll - this.lastScrollPosition) > 5) {
        // Update scroll state
        this.isScrolled = currentScroll > this.scrollThreshold;

        // Store the last scroll position
        this.lastScrollPosition = currentScroll;
      }
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Prevent body scroll when mobile menu is open
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  private initializeUserData() {
    // Implement user data initialization from your auth service
    // This is a placeholder - replace with actual implementation
    this.userImage = null;
    this.userName = null;
  }

  navigateToCalculateDailyIntake(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/food-entry']);
      this.closeNav();
    } else {
      this.authMessageService.showAuthMessage();
      this.closeNav();
    }
  }

  navigateToSavedItems(): void {
    this.router.navigate(['/profile'], {
      queryParams: { section: 'saveItem' },
    });
    this.closeNav();
  }

  setActiveSection(section: string): void {
    this.navigationService.setActiveSection(section);
  }

  onLogout(): void {
    this.authService.signOut().then(() => {
      this.router.navigate(['/auth']);
      this.closeNav();
    });
  }

  /** Falls back to the default avatar when the stored photo can't be shown. */
  onAvatarError = showDefaultAvatar;

  async onProfileImageChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // Clear the input so choosing the same file again still fires a change.
    input.value = '';
    if (file) {
      await this.profileImageService.upload(file);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
