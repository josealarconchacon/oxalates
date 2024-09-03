// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-header',
//   templateUrl: './header.component.html',
//   styleUrls: ['./header.component.css'],
// })
// export class HeaderComponent implements OnInit {
//   constructor(private router: Router) {}

//   ngOnInit(): void {}

//   openNav() {
//     const mySidenav = document.getElementById(
//       'mySidenav'
//     ) as HTMLElement | null;
//     if (mySidenav) {
//       mySidenav.style.width = '250px';
//     }
//   }

//   closeNav() {
//     const mySidenav = document.getElementById(
//       'mySidenav'
//     ) as HTMLElement | null;
//     if (mySidenav) {
//       mySidenav.style.width = '0';
//     }
//   }

//   search() {
//     this.router.navigate(['/oxalate']);
//   }

//   goToLandingPage() {
//     this.router.navigate(['/']);
//   }
// }

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isNavOpen = false; // Tracks whether the nav is open

  constructor(private router: Router) {}

  ngOnInit(): void {}

  toggleNav() {
    this.isNavOpen = !this.isNavOpen; // Toggle the navigation state
  }

  search() {
    this.router.navigate(['/oxalate']);
  }

  goToLandingPage() {
    this.router.navigate(['/']);
  }
}
