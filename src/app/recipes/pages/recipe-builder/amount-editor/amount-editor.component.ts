import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { RecipeIngredient } from '../../../model/recipe';
import { UnitOption, formatGrams } from '../../../engine/units';

let nextId = 0;

/**
 * Amount + unit for one ingredient, with "= 390 g" under it for measures.
 * Enter here doesn't submit the recipe form (it would save and leave).
 */
@Component({
  selector: 'app-amount-editor',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './amount-editor.component.html',
  styleUrl: './amount-editor.component.css',
})
export class AmountEditorComponent implements OnChanges {
  @Input({ required: true }) ingredient!: RecipeIngredient;
  @Input() options: UnitOption[] = [];
  @Input() invalid = false;
  @Input() describedBy: string | null = null;
  @Output() changed = new EventEmitter<RecipeIngredient>();

  readonly id = `amount-${nextId++}`;
  /** What's in the box, so "1." isn't rewritten while typing. */
  text = '';

  ngOnChanges(changes: SimpleChanges): void {
    const prev = changes['ingredient']?.previousValue as RecipeIngredient | undefined;
    const next = this.ingredient;
    // Refill the box only when another ingredient or unit arrives.
    if (!prev || prev.id !== next.id || prev.inputUnit !== next.inputUnit) {
      this.text = next.inputAmount > 0 ? formatGrams(next.inputAmount) : '';
    }
  }

  get unitValue(): string {
    return this.ingredient.inputUnit === 'g' ? 'g' : 'serving';
  }

  get helper(): string | null {
    const i = this.ingredient;
    if (i.inputUnit !== 'serving' || i.grams === null || !(i.inputAmount > 0)) return null;
    return `= ${formatGrams(i.grams)} g`;
  }

  onAmount(raw: string): void {
    this.text = raw;
    const n = Number(raw.replace(',', '.').trim());
    const amount = raw.trim() && Number.isFinite(n) && n >= 0 ? n : 0;
    this.changed.emit(this.withAmount(amount, this.ingredient.inputUnit));
  }

  /** Switching unit keeps the same quantity where it can. */
  onUnit(value: string): void {
    const i = this.ingredient;
    const serving = this.options.find((o) => o.unit === 'serving');
    if (value === 'g') {
      const grams = i.grams ?? (serving?.servingGrams ? serving.servingGrams * i.inputAmount : 100);
      this.emitUnitChange({ ...this.withAmount(round(grams, 1), 'g'), servingLabel: undefined });
    } else if (serving) {
      const count = i.grams && serving.servingGrams ? round(i.grams / serving.servingGrams, 2) : 1;
      this.emitUnitChange({
        ...this.withAmount(count || 1, 'serving'),
        servingLabel: serving.servingLabel ?? undefined,
      });
    }
  }

  private emitUnitChange(updated: RecipeIngredient): void {
    this.text = formatGrams(updated.inputAmount);
    this.changed.emit(updated);
  }

  private withAmount(amount: number, unit: 'g' | 'serving'): RecipeIngredient {
    const servingGrams = this.options.find((o) => o.unit === 'serving')?.servingGrams ?? null;
    const grams = unit === 'g' ? amount : servingGrams !== null ? servingGrams * amount : null;
    return { ...this.ingredient, inputUnit: unit, inputAmount: amount, grams };
  }
}

function round(n: number, places: number): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}
