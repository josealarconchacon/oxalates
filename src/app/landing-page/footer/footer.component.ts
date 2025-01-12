import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit, OnDestroy {
  showBackToHome: boolean = false;
  private routerSubscription!: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showBackToHome = event.url === '/oxalate';
      }
    });
  }

  search(): void {
    this.router.navigate(['/oxalate']);
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}
