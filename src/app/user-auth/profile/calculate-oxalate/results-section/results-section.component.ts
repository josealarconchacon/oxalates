import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-results-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-section.component.html',
  styleUrl: './results-section.component.css',
})
export class ResultsSectionComponent {
  @Input() foodName: string = '';
  @Input() oxalatePerServing: number = 0;
  @Input() solubleOxalatePerServing: number = 0;
}
