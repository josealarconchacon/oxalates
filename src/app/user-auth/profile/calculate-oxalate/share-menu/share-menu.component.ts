import {
  menuAnimation,
  slideIn,
} from 'src/app/shared/animations/menuAnimation';
import { shareOptions } from 'src/app/shared/utils/share-options.util';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-share-menu',
  standalone: true,
  imports: [DecimalPipe, CommonModule],
  templateUrl: './share-menu.component.html',
  styleUrls: ['./share-menu.component.css'],
  animations: [menuAnimation, slideIn],
})
export class ShareMenuComponent {
  shareOptions = shareOptions;
  copySuccess: boolean = false;

  @Input() dailyMeals: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Input() dailyTotal: { totalOxalate: number; totalSolubleOxalate: number } = {
    totalOxalate: 0,
    totalSolubleOxalate: 0,
  };

  getShareableText(): string {
    const dailyTotal = this.dailyTotal;
    const dailyMeals = this.dailyMeals;

    let text = `📅 Daily Oxalate Summary\n\n`;
    text += `🔹 Total Oxalate for the Day: ${dailyTotal.totalOxalate}mg\n\n`;

    if (dailyMeals.length > 0) {
      text += `🍽️ Meals Breakdown:\n`;
      dailyMeals.forEach((meal) => {
        text += `  🥄 ${meal.title}:\n`;
        meal.items.forEach((item: any) => {
          text += `    - 🌿 ${item.foodName}: ${item.oxalatePerServing}mg oxalate, ${item.solubleOxalatePerServing}mg soluble oxalate\n`;
        });
      });
      text += `\n`;
    }

    text += `🔖 Note: Keep track of your daily oxalate intake to maintain a healthy balance.\n\n`;
    text += `📲 Stay healthy, and track your meals!`;

    return text;
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
