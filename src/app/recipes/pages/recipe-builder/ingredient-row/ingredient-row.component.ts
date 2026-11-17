import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { IngredientBreakdown, RecipeIngredient } from '../../../model/recipe';
import { formatMg } from '../../../engine/format';
import { UnitOption, describeAmount } from '../../../engine/units';
import { AmountEditorComponent } from '../amount-editor/amount-editor.component';

/**
 * One ingredient. From 768px: name | amount + unit | mg | remove.
 * Below: name + amount text | mg | remove, and the row opens an amount sheet.
 */
@Component({
  selector: 'app-ingredient-row',
  standalone: true,
  imports: [IconComponent, AmountEditorComponent],
  templateUrl: './ingredient-row.component.html',
  styleUrl: './ingredient-row.component.css',
})
export class IngredientRowComponent {
  @Input({ required: true }) ingredient!: RecipeIngredient;
  /** The engine's result for this row (mg, known). */
  @Input() row: IngredientBreakdown | undefined;
  @Input() options: UnitOption[] = [];
  /** e.g. "Source: LO Cookbook 2" */
  @Input() source = '';
  /** Validation message for this row (after Save was tried). */
  @Input() error: string | null = null;
  @Output() changed = new EventEmitter<RecipeIngredient>();
  @Output() remove = new EventEmitter<void>();
  /** Phones: open the amount sheet. */
  @Output() openAmount = new EventEmitter<void>();

  get errorId(): string {
    return `ingredient-error-${this.ingredient.id}`;
  }

  get hasAmount(): boolean {
    return this.ingredient.inputAmount > 0;
  }

  get mgText(): string {
    return this.row?.mg != null ? `${formatMg(this.row.mg)} mg` : '';
  }

  get amountText(): string {
    const servingGrams = this.options.find((o) => o.unit === 'serving')?.servingGrams ?? null;
    return this.hasAmount ? describeAmount(this.ingredient, servingGrams) : 'No amount yet';
  }
}
