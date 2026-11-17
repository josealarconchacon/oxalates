import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { RecipeService } from '../../data/recipe.service';
import { Recipe } from '../../model/recipe';

/** /recipes/:id — one recipe, its numbers and what drives them. */
@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.css',
})
export class RecipeDetailComponent implements OnInit {
  private recipes = inject(RecipeService);
  private route = inject(ActivatedRoute);

  state: 'loading' | 'not-found' | 'error' | 'ready' = 'loading';
  recipe: Recipe | null = null;
  private id = '';

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    void this.load();
  }

  async load(): Promise<void> {
    this.state = 'loading';
    try {
      this.recipe = await this.recipes.get(this.id);
      this.state = this.recipe ? 'ready' : 'not-found';
    } catch {
      this.state = 'error';
    }
  }
}
