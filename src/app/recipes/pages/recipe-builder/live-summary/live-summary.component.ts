import { Component, Input } from '@angular/core';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { LevelPillComponent } from '../../../shared/level-pill/level-pill.component';
import { SummaryView } from './summary-view';

/** The numbers in the summary card (the buttons live in the builder). */
@Component({
  selector: 'app-live-summary',
  standalone: true,
  imports: [IconComponent, LevelPillComponent],
  templateUrl: './live-summary.component.html',
  styleUrl: './live-summary.component.css',
})
export class LiveSummaryComponent {
  @Input({ required: true }) view!: SummaryView;
  @Input() serves = 1;
  @Input() ingredientCount = 0;
}
