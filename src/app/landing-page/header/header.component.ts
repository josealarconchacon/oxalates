import { Router, ActivatedRoute } from '@angular/router';
import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';

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

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

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
  }

  search() {
    this.router.navigate(['/oxalate']);
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
}
