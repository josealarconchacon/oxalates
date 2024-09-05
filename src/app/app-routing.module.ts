import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OxalateComponent } from './landing-page/dialog-service/oxalate/oxalate.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ViewMoreComponent } from './landing-page/dialog-service/oxalate/view-more/view-more.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'oxalate', component: OxalateComponent },
  { path: 'view-more', component: ViewMoreComponent },
  // { path: '', redirectTo: '/oxalates', pathMatch: 'full' },
  // Add other routes as needed
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
