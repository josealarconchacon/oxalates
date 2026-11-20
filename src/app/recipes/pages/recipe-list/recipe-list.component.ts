import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { RecipeFoodsService } from '../../data/recipe-foods.service';
import { RecipeService } from '../../data/recipe.service';
import { calculateRecipe } from '../../engine/recipe-calculator';
import { levelForMgPerServing } from '../../engine/recipe-level';
import { DEFAULT_SORT, ListItem, SORT_OPTIONS, SortKey, countLine, isSortKey, toListItem } from './list-query';
import { RecipeCardComponent } from './recipe-card/recipe-card.component';
import { RecipeRowComponent } from './recipe-row/recipe-row.component';

/** /recipes: your recipes, with search, sort and tag filters. */
@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [RouterLink, IconComponent, RecipeCardComponent, RecipeRowComponent],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css',
})
export class RecipeListComponent implements OnInit {
  private recipes = inject(RecipeService);
  private foods = inject(RecipeFoodsService);
  private breakpoints = inject(BreakpointObserver);
  private destroyRef = inject(DestroyRef);

  state: 'loading' | 'error' | 'ready' = 'loading';
  /** Every recipe, with its engine result worked out once per load. */
  items: ListItem[] = [];
  /** ≤ 640px: compact rows instead of cards (only one of them is in the page). */
  phone = false;
  readonly skeletons = [1, 2, 3];
  readonly sortOptions = SORT_OPTIONS;

  /** What's typed in the search box. */
  query = '';
  sort: SortKey = DEFAULT_SORT;

  ngOnInit(): void {
    this.breakpoints
      .observe('(max-width: 640px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => (this.phone = state.matches));
    void this.load();
  }

  async load(): Promise<void> {
    this.state = 'loading';
    try {
      const [recipes, getFood] = await Promise.all([
        this.recipes.list(),
        firstValueFrom(this.foods.lookup$),
      ]);
      this.items = recipes.map((recipe) => toListItem(recipe, calculateRecipe(recipe, getFood, levelForMgPerServing)));
      this.state = 'ready';
    } catch {
      this.state = 'error';
    }
  }

  /** "6 recipes · sorted by oxalate per serving" (announced politely as it changes). */
  get count(): string {
    return countLine(this.items.length, this.sort);
  }

  onSearch(text: string): void {
    this.query = text;
  }

  onSort(value: string): void {
    if (isSortKey(value)) this.sort = value;
  }
}
