import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  constructor(private router: Router) {}

  openNav() {
    const mySidenav = document.getElementById(
      'mySidenav'
    ) as HTMLElement | null;
    if (mySidenav) {
      mySidenav.style.width = '250px';
    }
  }

  closeNav() {
    const mySidenav = document.getElementById(
      'mySidenav'
    ) as HTMLElement | null;
    if (mySidenav) {
      mySidenav.style.width = '0';
    }
  }

  search() {
    this.router.navigate(['/oxalate']);
  }

  goToLandingPage() {
    this.router.navigate(['/']);
  }
}
