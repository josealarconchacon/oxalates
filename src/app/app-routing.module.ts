import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OxalateComponent } from './landing-page/search-dialog/dialog-service/oxalate/oxalate.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'oxalate', component: OxalateComponent },
  // Add other routes as needed
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
