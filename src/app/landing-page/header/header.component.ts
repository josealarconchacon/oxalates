import { Router, ActivatedRoute } from '@angular/router';
import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { NavigationService } from 'src/app/user-auth/service/navigation.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class HeaderComponent implements OnInit {
  isNavOpen = false;
  isLoggedIn = false;
  userProfile: any;
  currentRoute: string = '';
  isScrolled = false;
  isMobileMenuOpen = false;
  userImage: string | null = null;
  userName: string | null = null;

  activeSection$: Observable<string>;
  isMobile$: Observable<boolean>;
  isDarkTheme$ = this.themeService.isDarkTheme$;

  navItems = [
    { title: 'Profile Info', section: 'profile' },
    { title: 'Saved Items', section: 'saveItem', icon: 'fas fa-bookmark' },
    {
      title: 'Calculate Daily Intake',
      section: 'calculate-oxalate',
      icon: 'fa fa-i-cursor',
    },
  ];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private navigationService: NavigationService,
    private breakpointObserver: BreakpointObserver,
    private themeService: ThemeService
  ) {
    this.activeSection$ = this.navigationService.activeSection$;
    this.isMobile$ = this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map((result) => result.matches));
  }

  ngOnInit(): void {
    this.authService.userProfile$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.userProfile = user;
    });

    // Get the current route
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });

    // Initialize user data from your auth service
    this.initializeUserData();
  }

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
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
    // Change header background when scrolled past 50px
    this.isScrolled = window.scrollY > 50;
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

  toggleProfileMenu() {
    // Implement profile menu toggle logic
  }

  private initializeUserData() {
    // Implement user data initialization from your auth service
    // This is a placeholder - replace with actual implementation
    this.userImage = null;
    this.userName = null;
  }

  navigateToCalculateDailyIntake(): void {
    this.router.navigate(['/profile'], {
      queryParams: { section: 'calculate-oxalate' },
    });
    this.closeNav();
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

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfile.photoURL = e.target.result;
        this.authService
          .updateProfileImage(e.target.result)
          .then(() => {
            console.log('Profile image updated successfully');
          })
          .catch((error) => {
            console.error('Error updating profile image:', error);
          });
      };
      reader.readAsDataURL(file);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
