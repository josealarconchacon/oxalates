import { Routes } from '@angular/router';

/** Lazy-loaded under /recipes (signed-in only, see app-routing). */
export const RECIPE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/recipe-list/recipe-list.component').then((m) => m.RecipeListComponent),
    title: 'Your recipes',
  },
];
