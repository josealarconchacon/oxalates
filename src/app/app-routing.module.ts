import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OxalateComponent } from './landing-page/dialog-service/oxalate/oxalate.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ViewMoreComponent } from './landing-page/dialog-service/oxalate/view-more/view-more.component';
import { AuthComponent } from './user-auth/auth/auth.component';
import { ProfileComponent } from './user-auth/profile/profile.component';
import { AuthGuard } from './user-auth/service/auth.guard';

const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', component: LandingPageComponent },
  { path: 'oxalate', component: OxalateComponent },
  { path: 'view-more', component: ViewMoreComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
