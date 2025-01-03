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
  @Input() servingGrams: number = 0;
  @Input() customServing: number | null = null;
  @Output() customServingChange = new EventEmitter<number | null>();

  onCustomServingChange(value: string): void {
    const numValue = value ? Number(value) : null;
    this.customServingChange.emit(numValue);
  }
}
