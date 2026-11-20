import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { RecipeFoodsService } from '../../data/recipe-foods.service';
import { RecipeService } from '../../data/recipe.service';
import { formatMg } from '../../engine/format';
import { calculateRecipe } from '../../engine/recipe-calculator';
import { levelForMgPerServing } from '../../engine/recipe-level';
import { LevelPillComponent } from '../../shared/level-pill/level-pill.component';
import { DEFAULT_SORT, SORT_OPTIONS, SortKey, countLine, isSortKey } from './list-query';

interface RecipeRow {
  id: string;
  name: string;
  serves: number;
  perServing: string;
  level: string | null;
  incomplete: boolean;
}

/** /recipes: your recipes, with search, sort and tag filters. */
@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [RouterLink, IconComponent, LevelPillComponent],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css',
})
export class RecipeListComponent implements OnInit {
  private recipes = inject(RecipeService);
  private foods = inject(RecipeFoodsService);

  state: 'loading' | 'error' | 'ready' = 'loading';
  rows: RecipeRow[] = [];
  readonly skeletons = [1, 2, 3];
  readonly sortOptions = SORT_OPTIONS;

  /** What's typed in the search box. */
  query = '';
  sort: SortKey = DEFAULT_SORT;

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.state = 'loading';
    try {
      const [recipes, getFood] = await Promise.all([
        this.recipes.list(),
        firstValueFrom(this.foods.lookup$),
      ]);
      this.rows = recipes.map((recipe) => {
        const result = calculateRecipe(recipe, getFood, levelForMgPerServing);
        return {
          id: recipe.id,
          name: recipe.name,
          serves: recipe.serves,
          perServing: formatMg(result.perServingMg),
          level: result.level,
          incomplete: result.incomplete,
        };
      });
      this.state = 'ready';
    } catch {
      this.state = 'error';
    }
  }

  /** "6 recipes · sorted by oxalate per serving" (announced politely as it changes). */
  get count(): string {
    return countLine(this.rows.length, this.sort);
  }

  onSearch(text: string): void {
    this.query = text;
  }

  onSort(value: string): void {
    if (isSortKey(value)) this.sort = value;
  }
}
