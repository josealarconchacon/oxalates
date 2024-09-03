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
