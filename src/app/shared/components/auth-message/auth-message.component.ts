import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AuthMessageService, AuthMessageTopic } from '../../services/auth-message.service';
import { DialogDirective } from '../../directives/dialog.directive';

interface AuthMessageCopy {
  title: string;
  text: string;
  benefits: { icon: string; title: string; text: string }[];
}

/**
 * Shown when a visitor who isn't signed in picks a feature that needs an
 * account ("Calculate Daily Intake" or "Recipes"). It says what an account
 * gives them and lets them sign in or stay where they are.
 */
@Component({
  selector: 'app-auth-message',
  imports: [AsyncPipe, DialogDirective],
  templateUrl: './auth-message.component.html',
  styleUrls: ['./auth-message.component.css'],
})
export class AuthMessageComponent {
  /** Wording per feature: Daily Intake (the default) or Recipes. */
  private readonly copy: Record<AuthMessageTopic, AuthMessageCopy> = {
    intake: {
      title: 'Track your daily oxalate intake',
      text: 'This needs a free account, so your log is saved and ready on any device.',
      benefits: [
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
      ],
    },
    recipes: {
      title: 'Save your own recipes',
      text: 'Recipes need a free account, so your recipes are saved and ready on any device.',
      benefits: [
        {
          icon: 'restaurant_menu',
          title: 'Build a recipe',
          text: 'Add ingredients from the food list and see the oxalate per serving.',
        },
        {
          icon: 'search',
          title: 'Find them fast',
          text: 'Search, sort and tag your recipes.',
        },
        {
          icon: 'event_note',
          title: 'Log a serving',
          text: 'Add a serving to your daily food log in a few taps.',
        },
      ],
    },
  };

  get content(): AuthMessageCopy {
    return this.copy[this.authMessageService.topic];
  }

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
