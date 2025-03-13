import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../shared/services/theme.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit {
  isDarkTheme$ = this.themeService.isDarkTheme$;

  constructor(private themeService: ThemeService) {}

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
