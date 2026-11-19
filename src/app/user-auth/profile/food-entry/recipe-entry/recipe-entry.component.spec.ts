import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RecipeEntry } from '../service/food-entry.service';
import { RecipeEntryComponent, servingsLabel } from './recipe-entry.component';

export function recipeEntry(over: Partial<RecipeEntry['snapshot']> = {}): RecipeEntry {
  const snapshot = {
    recipeId: 'r1',
    recipeName: 'Lemon herb chicken',
    multiplier: 1,
    mg: 5.6,
    solubleMg: 2.8,
    level: 'Low',
    incomplete: false,
    solubleIncomplete: false,
    ingredients: [{ name: 'Rice', grams: 100, mg: 5.6 }],
    dataUpdatedAt: '2024-07-27',
    loggedAt: '2026-11-18T12:00:00.000Z',
    ...over,
  };
  return {
    kind: 'recipe',
    entryId: 'e1',
    snapshot,
    foodName: snapshot.recipeName,
    servingSize: 'recipe',
    numberOfServings: snapshot.multiplier,
    oxalatePerServing: snapshot.mg / snapshot.multiplier,
    solubleOxalatePerServing: snapshot.solubleMg / snapshot.multiplier,
  };
}

describe('RecipeEntryComponent', () => {
  let fixture: ComponentFixture<RecipeEntryComponent>;
  const el = () => fixture.nativeElement as HTMLElement;
  const text = (sel: string) => (el().querySelector(sel)?.textContent ?? '').replace(/\s+/g, ' ').trim();

  function render(entry: RecipeEntry, deleted = false) {
    TestBed.configureTestingModule({ imports: [RecipeEntryComponent], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(RecipeEntryComponent);
    fixture.componentRef.setInput('entry', entry);
    fixture.componentRef.setInput('deleted', deleted);
    fixture.detectChanges();
  }

  it('servings labels', () => {
    expect(servingsLabel(0.5)).toBe('½ serving');
    expect(servingsLabel(1)).toBe('1 serving');
    expect(servingsLabel(2)).toBe('2 servings');
    expect(servingsLabel(1.5)).toBe('1.5 servings');
    expect(servingsLabel(0.25)).toBe('¼ serving');
  });

  it('shows the name as a link to the recipe, "Recipe · N serving", mg and level from the snapshot', () => {
    render(recipeEntry({ multiplier: 0.5, mg: 2.8 }));
    expect(el().querySelector('a.name')!.getAttribute('href')).toBe('/recipes/r1');
    expect(text('.name')).toBe('Lemon herb chicken');
    expect(text('.sub')).toBe('Recipe · ½ serving');
    expect(text('.mg')).toBe('2.8 mg');
    expect(text('app-level-pill')).toBe('Low');
    expect(el().querySelector('.incomplete')).toBeNull();
  });

  it('incomplete: "at least", "At least" pill and an Incomplete badge', () => {
    render(recipeEntry({ incomplete: true }));
    expect(text('.mg')).toBe('at least 5.6 mg');
    expect(text('app-level-pill')).toBe('At least Low');
    expect(text('.incomplete')).toBe('Incomplete');
  });

  it('all ingredients unknown: "Unknown", no pill, never 0', () => {
    render(recipeEntry({ incomplete: true, mg: 0, level: null, ingredients: [{ name: 'X', grams: 10, mg: null }] }));
    expect(text('.mg')).toBe('Unknown');
    expect(el().querySelector('app-level-pill')).toBeNull();
  });

  it('deleted recipe: plain text and "Recipe deleted"; the numbers stay', () => {
    render(recipeEntry(), true);
    expect(el().querySelector('a')).toBeNull();
    expect(text('.name')).toBe('Lemon herb chicken');
    expect(text('.sub')).toBe('Recipe · 1 serving · Recipe deleted');
    expect(text('.mg')).toBe('5.6 mg');
  });
});
