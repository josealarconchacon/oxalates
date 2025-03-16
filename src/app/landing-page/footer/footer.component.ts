import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../user-auth/service/auth-service.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  providers: [AuthService],
})
export class FooterComponent implements OnInit, OnDestroy {
  showBackToHome: boolean = false;
  private routerSubscription!: Subscription;

  constructor(private router: Router, private authService: AuthService) {}

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

  navigateToCalculateDailyIntake() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/food-entry']);
    } else {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/food-entry' },
      });
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}
