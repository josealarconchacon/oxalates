import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AuthMessageService } from '../../services/auth-message.service';
import { DialogDirective } from '../../directives/dialog.directive';

/**
 * Shown when a visitor who isn't signed in picks a feature that needs an
 * account (for example "Calculate Daily Intake"). It says what an account
 * gives them and lets them sign in or stay where they are.
 */
@Component({
  selector: 'app-auth-message',
  imports: [AsyncPipe, DialogDirective],
  templateUrl: './auth-message.component.html',
  styleUrls: ['./auth-message.component.css'],
})
export class AuthMessageComponent {
  readonly benefits = [
    {
      icon: 'event_note',
      title: 'A daily food log',
      text: 'Add what you eat and see your total and soluble oxalate for the day.',
    },
    {
      icon: 'bookmark',
      title: 'Saved foods',
      text: 'Keep the foods you look up most in one list.',
    },
    {
      icon: 'description',
      title: 'Reports',
      text: 'Download any day as a PDF or CSV to share with your doctor.',
    },
  ];

  constructor(public authMessageService: AuthMessageService) {}

  signIn(): void {
    this.authMessageService.continueToAuth();
  }

  dismiss(): void {
    this.authMessageService.dismiss();
  }

  /** A click on the dimmed area outside the box closes it, like Escape. */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.dismiss();
    }
  }
}
