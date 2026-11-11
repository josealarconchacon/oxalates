
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-serving-panel',
  imports: [FormsModule, IconComponent],
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

  /** The buttons can't take it below 1; typing smaller values still works. */
  get canDecrease(): boolean {
    return (parseFloat(this.numberOfServings) || 1) > 1;
  }

  /** −/+ : one serving down or up, sent through the same path as typing. */
  step(delta: number): void {
    const current = parseFloat(this.numberOfServings) || 1;
    const next = Math.round((current + delta) * 100) / 100;
    this.onNumberOfServingsChange(String(next));
  }
}
