import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isNavOpen = false;
  isLoggedIn = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.userProfile$.subscribe((user) => {
      this.isLoggedIn = !!user;
    });
  }

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
  }

  search() {
    this.router.navigate(['/oxalate']);
  }

  goToLandingPage() {
    this.router.navigate(['/']);
  }

  goToProfile() {
    if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/auth']);
    }
  }
}
