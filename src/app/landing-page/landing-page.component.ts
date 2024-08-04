import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResourceService } from './service/resource.service';
import { Resource } from './model/resource';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit {
  foodResources: Resource[] = [];
  showOxalateComponent = false;

  constructor(
    private route: ActivatedRoute,
    private resourceService: ResourceService
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['showOxalate']) {
        this.showOxalateComponent = true;
        this.scrollToOxalate();
      }
    });
  }

  ngOnInit(): void {
    this.foodResources = this.resourceService.getFoodResources();
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
