import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SimilarFood } from '../../model/similar-food';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-search-section',
  imports: [FormsModule, CommonModule, IconComponent],
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
  /** Esc with the list open: close the list only (not the dialog). */
  @Output() dismiss = new EventEmitter<void>();

  @ViewChild('resultsList') resultsList?: ElementRef<HTMLElement>;

  /** Highlighted result for ↑/↓/Enter; -1 means none. */
  activeIndex = -1;

  get isOpen(): boolean {
    return this.showSuggestions && this.similarFoods.length > 0;
  }

  /** What is in the box: the typed text, or the picked food's name. */
  query = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['foodName']) {
      this.query = this.foodName;
    }
    if (changes['similarFoods']) {
      this.activeIndex = -1; // a new list starts with nothing highlighted
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
    this.activeIndex = -1;
    this.selectFood.emit(food);
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) return;
    const last = this.similarFoods.length - 1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveTo(this.activeIndex >= last ? 0 : this.activeIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveTo(this.activeIndex <= 0 ? last : this.activeIndex - 1);
        break;
      case 'Enter':
        if (this.activeIndex >= 0) {
          event.preventDefault();
          this.onSelectFood(this.similarFoods[this.activeIndex]);
        }
        break;
      case 'Escape':
        // Stop here so the dialog stays open; the next Esc closes it.
        event.preventDefault();
        event.stopPropagation();
        this.activeIndex = -1;
        this.dismiss.emit();
        break;
    }
  }

  private moveTo(index: number): void {
    this.activeIndex = index;
    // Keep the highlighted row visible inside the scrolling list.
    setTimeout(() =>
      this.resultsList?.nativeElement
        .querySelector(`#food-result-${index}`)
        ?.scrollIntoView({ block: 'nearest' })
    );
  }
}
