import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../user-auth/service/auth-service.service';
import { CommonModule } from '@angular/common';
import { AuthMessageService } from '../../shared/services/auth-message.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [AuthService],
})
export class FooterComponent implements OnInit, OnDestroy {
  showBackToHome: boolean = false;
  /** Read when the footer is created, so the year never goes stale. */
  readonly currentYear = new Date().getFullYear();
  private routerSubscription!: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private authMessageService: AuthMessageService
  ) {}

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
      this.authMessageService.showAuthMessage();
    }
  }

  navigateToSuggestions() {
    this.router.navigate(['/suggestions']);
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}
