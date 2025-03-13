import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-serving-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './serving-panel.component.html',
  styleUrl: './serving-panel.component.css',
})
export class ServingPanelComponent {
  @Input() servingSize: string = '';
  @Input() totalOxalatePerServing: number = 0;
  @Input() totalSolubleOxalatePerServing: number = 0;
  @Input() numberOfServings: string = '1';
  @Input() isDarkTheme: boolean = false;
  @Output() numberOfServingsChange = new EventEmitter<string>();

  isFoodSelected: boolean = false;

  onNumberOfServingsChange(value: string): void {
    this.numberOfServingsChange.emit(value);
  }
}
