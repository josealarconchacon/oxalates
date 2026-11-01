import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OxalateComponent } from './landing-page/dialog-service/oxalate/oxalate.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ViewMoreComponent } from './landing-page/dialog-service/oxalate/view-more/view-more.component';
import { AuthComponent } from './user-auth/auth/auth.component';
import { AuthGuard } from './user-auth/service/auth.guard';
import { ContributionComponent } from './landing-page/contribution/contribution.component';
import { SuggestionsComponent } from './landing-page/suggestions/suggestions.component';
import { NotFoundComponent } from './landing-page/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
    title: 'Sign in or create an account',
  },
  {
    path: '',
    component: LandingPageComponent,
    title: 'Oxalate levels in common foods',
  },
  {
    path: 'oxalate',
    component: OxalateComponent,
    title: 'Search foods by oxalate level',
  },
  { path: 'view-more', component: ViewMoreComponent, title: 'Food details' },
  {
    path: 'contribution',
    component: ContributionComponent,
    title: 'Support the project',
  },
  {
    path: 'suggestions',
    component: SuggestionsComponent,
    title: 'Share feedback',
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./user-auth/profile/profile.module').then((m) => m.ProfileModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'food-entry',
    loadComponent: () =>
      import('./user-auth/profile/food-entry/food-entry.component').then(
        (m) => m.FoodEntryComponent
      ),
    canActivate: [AuthGuard],
    title: 'Daily oxalate log',
  },
  { path: '**', component: NotFoundComponent, title: 'Page not found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
