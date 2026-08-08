import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthMessageService {
  private showMessageSubject = new BehaviorSubject<boolean>(false);
  showMessage$ = this.showMessageSubject.asObservable();
  private timerSubscription: Subscription | null = null;
  private resolveShowAuthMessage: (() => void) | null = null;

  constructor(private router: Router) {}

  showAuthMessage(): Promise<void> {
    return new Promise((resolve) => {
      this.resolveShowAuthMessage = resolve;
      this.showMessageSubject.next(true);
      this.timerSubscription = timer(10000).subscribe(() => {
        this.continueToAuth();
      });
    });
  }

  continueToAuth(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
    this.showMessageSubject.next(false);
    this.router.navigate(['/auth']);
    if (this.resolveShowAuthMessage) {
      this.resolveShowAuthMessage();
      this.resolveShowAuthMessage = null;
    }
  }
}
