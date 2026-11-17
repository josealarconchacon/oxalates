import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

/** Lazy-loaded under /recipes (signed-in only, see app-routing). */
export const RECIPE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/recipe-list/recipe-list.component').then((m) => m.RecipeListComponent),
    title: 'Your recipes',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/recipe-builder/recipe-builder.component').then((m) => m.RecipeBuilderComponent),
    title: 'New recipe',
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/recipe-builder/recipe-builder.component').then((m) => m.RecipeBuilderComponent),
    title: 'Edit recipe',
    canDeactivate: [unsavedChangesGuard],
  },
];
