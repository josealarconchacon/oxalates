import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SimilarFood } from '../../model/similar-food';
import { ClickableDirective } from '../../../../shared/directives/clickable.directive';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-search-section',
  imports: [FormsModule, CommonModule, ClickableDirective, IconComponent],
  templateUrl: './search-section.component.html',
  styleUrl: './search-section.component.css',
})
export class SearchSectionComponent implements OnChanges {
  @Input() foodName: string = '';
  @Input() similarFoods: SimilarFood[] = [];
  @Input() showSuggestions: boolean = false;
  @Input() isDarkTheme: boolean = false;
  @Output() foodNameChange = new EventEmitter<string>();
  @Output() selectFood = new EventEmitter<SimilarFood>();
  @Output() clear = new EventEmitter<void>();

  /** What is in the box: the typed text, or the picked food's name. */
  query = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['foodName']) {
      this.query = this.foodName;
    }
  }

  /** The × button: empty the box, tell the form, and keep typing there. */
  onClear(input: HTMLInputElement): void {
    this.query = '';
    this.clear.emit();
    input.focus();
  }

  onFoodNameChange(newValue: string): void {
    this.foodNameChange.emit(newValue);
  }

  onSelectFood(food: SimilarFood): void {
    this.selectFood.emit(food);
  }
}
