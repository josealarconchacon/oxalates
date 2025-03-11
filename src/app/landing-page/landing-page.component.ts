import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    // Initialize any necessary data or services
  }

  onRegister() {
    console.log('Register button clicked');
  }

  scrollToOxalate() {
    setTimeout(() => {
      const element = document.querySelector('app-oxalate');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  }
}
