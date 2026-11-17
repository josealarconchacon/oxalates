import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from 'src/app/landing-page/dialog-service/oxalate/service/notification.service';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { RecipeDraft, RecipeService } from '../../data/recipe.service';
import { Recipe, RecipeIngredient } from '../../model/recipe';
import { ServesStepperComponent } from './serves-stepper/serves-stepper.component';

/** Create (/recipes/new) or edit (/recipes/:id/edit) a recipe. */
@Component({
  selector: 'app-recipe-builder',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent, ServesStepperComponent],
  templateUrl: './recipe-builder.component.html',
  styleUrl: './recipe-builder.component.css',
})
export class RecipeBuilderComponent implements OnInit {
  private recipes = inject(RecipeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notifications = inject(NotificationService);

  @ViewChild('nameInput') private nameInput?: ElementRef<HTMLInputElement>;

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    serves: new FormControl<number | null>(4),
    notes: new FormControl('', { nonNullable: true }),
  });
  // Edited by later steps (ingredient rows, tags); kept as-is on save.
  ingredients: RecipeIngredient[] = [];
  tags: string[] = [];

  mode: 'create' | 'edit' = 'create';
  state: 'loading' | 'not-found' | 'ready' = 'ready';
  saving = false;
  saveFailed = false;
  nameError: string | null = null;
  private recipe: Recipe | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode = 'edit';
      void this.load(id);
    }
  }

  async load(id: string): Promise<void> {
    this.state = 'loading';
    try {
      const recipe = await this.recipes.get(id);
      if (!recipe) {
        this.state = 'not-found';
        return;
      }
      this.recipe = recipe;
      this.form.setValue({ name: recipe.name, serves: recipe.serves, notes: recipe.notes ?? '' });
      this.ingredients = recipe.ingredients ?? [];
      this.tags = recipe.tags ?? [];
      this.state = 'ready';
    } catch {
      this.state = 'not-found';
    }
  }

  async save(): Promise<void> {
    if (this.saving) return;
    const { name, serves, notes } = this.form.getRawValue();
    this.nameError = name.trim() ? null : 'Give your recipe a name.';
    if (this.nameError) {
      this.nameInput?.nativeElement.focus();
      return;
    }
    const draft: RecipeDraft = {
      name: name.trim(),
      serves: serves ?? 1,
      notes,
      tags: this.tags,
      ingredients: this.ingredients,
    };

    this.saving = true;
    this.saveFailed = false;
    try {
      if (this.recipe) {
        await this.recipes.update({ ...this.recipe, ...draft });
      } else {
        await this.recipes.create(draft);
      }
      this.notifications.show('Recipe saved.', 'Close', ['success-snackbar']);
      // TODO(PR 3): open the recipe's detail page instead of the list.
      void this.router.navigate(['/recipes']);
    } catch {
      this.saveFailed = true;
    } finally {
      this.saving = false;
    }
  }

  clearNameError(): void {
    this.nameError = null;
  }
}
