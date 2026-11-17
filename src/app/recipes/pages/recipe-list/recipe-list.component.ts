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

interface RecipeRow {
  id: string;
  name: string;
  serves: number;
  perServing: string;
  level: string | null;
  incomplete: boolean;
}

/** Temporary list of the user's recipes (PR 5 replaces it). */
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
}
