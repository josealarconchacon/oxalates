import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ColorSketchModule } from 'ngx-color/sketch';
import { ProfileComponent } from './profile.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { SaveItemsComponent } from './save-items/save-items.component';
import { ClickableDirective } from 'src/app/shared/directives/clickable.directive';
import { AlertComponent } from 'src/app/landing-page/dialog-service/oxalate/shared/alert/alert.component';

/**
 * The signed-in profile page and the pieces only it uses. It is loaded the first
 * time someone opens /profile, so visitors who never sign in do not download it.
 */
@NgModule({
  declarations: [ProfileComponent, ChangePasswordComponent, SaveItemsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ColorSketchModule,
    ClickableDirective,
    AlertComponent,
    RouterModule.forChild([
      { path: '', component: ProfileComponent, title: 'Your profile' },
    ]),
  ],
})
export class ProfileModule {}
