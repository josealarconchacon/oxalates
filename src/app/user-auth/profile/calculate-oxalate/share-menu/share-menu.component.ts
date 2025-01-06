import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-share-menu',
  standalone: true,
  imports: [DecimalPipe, CommonModule],
  templateUrl: './share-menu.component.html',
  styleUrls: ['./share-menu.component.css'],
  animations: [
    trigger('menuAnimation', [
      state(
        'hide',
        style({
          opacity: 0,
          transform: 'scale(0.95)',
          pointerEvents: 'none',
        })
      ),
      state(
        'show',
        style({
          opacity: 1,
          transform: 'scale(1)',
          pointerEvents: 'auto',
        })
      ),
      transition('hide => show', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)'),
      ]),
      transition('show => hide', [
        animate('150ms cubic-bezier(0.4, 0, 0.2, 1)'),
      ]),
    ]),
    trigger('slideIn', [
      state(
        'false',
        style({
          opacity: 0,
          transform: 'translateX(1rem)',
        })
      ),
      state(
        'true',
        style({
          opacity: 1,
          transform: 'translateX(0)',
        })
      ),
      transition('false => true', [
        animate(
          '200ms ease',
          style({ opacity: 0, transform: 'translateX(1rem)' })
        ),
        animate('{{delay}}ms', style({ opacity: 0 })),
        animate(
          '200ms ease',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
      transition('true => false', [
        animate(
          '150ms ease',
          style({ opacity: 0, transform: 'translateX(1rem)' })
        ),
      ]),
    ]),
  ],
})
export class ShareMenuComponent {
  @Input() dailyMeals: any[] = [];
  @Input() dailyTotal: { totalOxalate: number; totalSolubleOxalate: number } = {
    totalOxalate: 0,
    totalSolubleOxalate: 0,
  };
  @Output() close = new EventEmitter<void>();
  copySuccess: boolean = false;

  shareOptions: {
    label: string;
    icon: string;
    color: string;
    getShareUrl: (text: string) => string;
  }[] = [
    {
      label: 'Share on Facebook',
      icon: 'facebook',
      color: '#1877F2',
      getShareUrl: (text: string) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          window.location.href
        )}&quote=${encodeURIComponent(text)}`,
    },
    {
      label: 'Share on Reddit',
      icon: 'reddit',
      color: '#FF4500',
      getShareUrl: (text: string) =>
        `https://www.reddit.com/submit?url=${encodeURIComponent(
          window.location.href
        )}&summary=${encodeURIComponent(text)}`,
    },
  ];

  getShareableText(): string {
    return (
      `📅 *Daily Oxalate Summary*\n\n` +
      `🔹 *Total Oxalate for the Day*: ${this.dailyTotal.totalOxalate}mg\n\n` +
      `🍽️ *Meals Breakdown:*\n` +
      this.dailyMeals
        .map(
          (meal) =>
            `  🥄 *${meal.title}:*\n` +
            meal.items
              .map(
                (food: { foodName: any; oxalatePerServing: any }) =>
                  `    - 🌿 *${food.foodName}*: ${food.oxalatePerServing}mg oxalate`
              )
              .join('\n')
        )
        .join('\n') +
      `\n🔖 *Note*: Keep track of your daily oxalate intake to maintain a healthy balance.\n\n` +
      `📲 Stay healthy, and track your meals!`
    );
  }

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.getShareableText());
      this.copySuccess = true;
      setTimeout(() => (this.copySuccess = false), 2000);
    } catch (err) {
      console.error('Failed to copy results', err);
    }
  }

  closeShareMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.close.emit();
  }
}
