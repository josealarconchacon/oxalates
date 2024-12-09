import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
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

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.userProfile$.subscribe((user) => {
      console.log('User Profile:', user);
      this.isLoggedIn = !!user;
      this.userProfile = user;
    });
  }

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
  }

  goToLandingPage() {
    this.router.navigate(['/'], { queryParams: { scrollTo: 'top' } });
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
}
