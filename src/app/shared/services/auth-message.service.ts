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

  constructor(private router: Router) {}

  showAuthMessage(): Promise<void> {
    return new Promise((resolve) => {
      this.showMessageSubject.next(true);
      this.timerSubscription = timer(10000).subscribe(() => {
        this.continueToAuth();
        resolve();
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
  }
}
