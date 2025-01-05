import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-results-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-section.component.html',
  styleUrls: ['./results-section.component.css'],
})
export class ResultsSectionComponent {
  @Input() foodName: string | undefined;
  @Input() calculatedTotalOxalate: number = 0;
  @Input() calculatedTotalSolubleOxalate: number = 0;
  @Input() numberOfServings: number = 1;
}
