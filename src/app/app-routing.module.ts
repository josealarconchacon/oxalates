import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OxalateComponent } from './landing-page/dialog-service/oxalate/oxalate.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ViewMoreComponent } from './landing-page/dialog-service/oxalate/view-more/view-more.component';
import { AuthComponent } from './user-auth/auth/auth.component';
import { authGuard, signedOutGuard } from './user-auth/service/auth.guard';
import { ContributionComponent } from './landing-page/contribution/contribution.component';
import { SuggestionsComponent } from './landing-page/suggestions/suggestions.component';
import { NotFoundComponent } from './landing-page/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [signedOutGuard],
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
  // Linked from Google's sign-in consent screen; loaded only when opened.
  {
    path: 'privacy',
    loadComponent: () =>
      import('./landing-page/legal/privacy/privacy.component').then(
        (m) => m.PrivacyComponent
      ),
    title: 'Privacy Policy',
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./landing-page/legal/terms/terms.component').then(
        (m) => m.TermsComponent
      ),
    title: 'Terms of Use',
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
    canActivate: [authGuard],
  },
  {
    path: 'food-entry',
    loadComponent: () =>
      import('./user-auth/profile/food-entry/food-entry.component').then(
        (m) => m.FoodEntryComponent
      ),
    canActivate: [authGuard],
    title: 'Daily oxalate log',
  },
  { path: '**', component: NotFoundComponent, title: 'Page not found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
