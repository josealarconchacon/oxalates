import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeIngredient } from '../../../model/recipe';
import { unitOptions } from '../../../engine/units';
import { food, grams, servings } from '../../../engine/testing/fixtures';
import { AmountEditorComponent } from './amount-editor.component';

describe('AmountEditorComponent', () => {
  let fixture: ComponentFixture<AmountEditorComponent>;
  let emitted: RecipeIngredient[];
  const rice = food({ id: 'rice', serving_size: '1 cup', serving_g: '195.00' });
  const el = () => fixture.nativeElement as HTMLElement;

  function setup(ingredient: RecipeIngredient, options = unitOptions(rice)) {
    fixture = TestBed.createComponent(AmountEditorComponent);
    fixture.componentRef.setInput('ingredient', ingredient);
    fixture.componentRef.setInput('options', options);
    emitted = [];
    fixture.componentInstance.changed.subscribe((i) => {
      emitted.push(i);
      fixture.componentRef.setInput('ingredient', i);
    });
    fixture.detectChanges();
  }

  const select = () => el().querySelector('select')!;
  const input = () => el().querySelector('input')!;

  it('labels the amount and unit by ingredient name, and lists g + the measure', () => {
    setup(grams('rice', 120, 'Rice'));
    expect(input().getAttribute('aria-label')).toBe('Amount of Rice');
    expect(select().getAttribute('aria-label')).toBe('Unit for Rice');
    expect([...select().options].map((o) => o.text.trim())).toEqual(['g', '1 cup (195 g)']);
  });

  it('typing grams sets grams and amount', () => {
    setup(grams('rice', 120, 'Rice'));
    input().value = '90.5';
    input().dispatchEvent(new Event('input'));
    expect(emitted.at(-1)).toEqual(jasmine.objectContaining({ inputUnit: 'g', inputAmount: 90.5, grams: 90.5 }));
  });

  it('typing servings works out grams and shows "= 390 g"', () => {
    setup({ ...servings('rice', 1, 'Rice'), servingLabel: '1 cup', grams: 195 });
    input().value = '2';
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(emitted.at(-1)).toEqual(jasmine.objectContaining({ inputAmount: 2, grams: 390 }));
    expect(el().querySelector('.helper')!.textContent).toBe('= 390 g');
  });

  it('switching g → measure keeps the quantity (390 g = 2 cups), and back', () => {
    setup(grams('rice', 390, 'Rice'));
    select().value = 'serving';
    select().dispatchEvent(new Event('change'));
    expect(emitted.at(-1)).toEqual(
      jasmine.objectContaining({ inputUnit: 'serving', inputAmount: 2, grams: 390, servingLabel: '1 cup' })
    );
    select().value = 'g';
    select().dispatchEvent(new Event('change'));
    expect(emitted.at(-1)).toEqual(jasmine.objectContaining({ inputUnit: 'g', inputAmount: 390, grams: 390 }));
  });

  it('an empty box is amount 0 (no grams), not a value', () => {
    setup(grams('rice', 120, 'Rice'));
    input().value = '';
    input().dispatchEvent(new Event('input'));
    expect(emitted.at(-1)).toEqual(jasmine.objectContaining({ inputAmount: 0, grams: 0 }));
  });

  it('with only "g" the unit is shown but not changeable', () => {
    setup(grams('x', 10, 'Salt'), unitOptions(undefined));
    expect(select().disabled).toBeTrue();
  });
});
