import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SimilarFood } from '../../model/similar-food';

@Component({
  selector: 'app-search-section',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-section.component.html',
  styleUrl: './search-section.component.css',
})
export class SearchSectionComponent {
  @Input() foodName: string = '';
  @Input() similarFoods: SimilarFood[] = [];
  @Input() showSuggestions: boolean = false;
  @Output() foodNameChange = new EventEmitter<string>();
  @Output() selectFood = new EventEmitter<SimilarFood>();

  onFoodNameChange(newValue: string): void {
    this.foodNameChange.emit(newValue);
  }

  onSelectFood(food: SimilarFood): void {
    this.selectFood.emit(food);
  }
}
