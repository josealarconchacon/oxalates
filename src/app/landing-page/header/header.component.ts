import { Router, ActivatedRoute } from '@angular/router';
import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { NavigationService } from 'src/app/user-auth/service/navigation.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isNavOpen = false;
  isLoggedIn = false;
  userProfile: any;
  currentRoute: string = '';

  activeSection$: Observable<string>;
  isMobile$: Observable<boolean>;

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
    private breakpointObserver: BreakpointObserver
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
    this.router.navigate(['/login']);
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
    const header = document.querySelector('.header');
    if (header) {
      if (window.scrollY > 0) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
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
}
