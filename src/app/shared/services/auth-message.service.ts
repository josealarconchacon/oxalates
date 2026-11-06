import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Opens and closes the "sign in to use this" prompt shown when a visitor who
 * isn't signed in picks a feature that needs an account.
 *
 * The prompt never closes or navigates on its own: the visitor chooses to sign
 * in or to stay where they are.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthMessageService {
  private showMessageSubject = new BehaviorSubject<boolean>(false);
  readonly showMessage$ = this.showMessageSubject.asObservable();

  constructor(private router: Router) {}

  showAuthMessage(): void {
    this.showMessageSubject.next(true);
  }

  /** "Not now", the close button, Escape or a backdrop click: stay on the page. */
  dismiss(): void {
    this.showMessageSubject.next(false);
  }

  /** "Sign in or create account". */
  continueToAuth(): void {
    this.showMessageSubject.next(false);
    this.router.navigate(['/auth']);
  }
}
