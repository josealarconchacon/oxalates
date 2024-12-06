import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit {
  [x: string]: any;
  showOxalateComponent = false;

  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params) => {
      if (params['showOxalate']) {
        this.showOxalateComponent = true;
        this.scrollToOxalate();
      }
    });
  }

  ngOnInit(): void {}

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
