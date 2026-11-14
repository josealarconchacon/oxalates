import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { A11yModule } from '@angular/cdk/a11y';
import { ColorSketchModule } from 'ngx-color/sketch';
import { ProfileComponent } from './profile.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { SaveItemsComponent } from './save-items/save-items.component';
import { CoverColorDialogComponent } from './cover-color-dialog/cover-color-dialog.component';
import { ClickableDirective } from 'src/app/shared/directives/clickable.directive';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { AlertComponent } from 'src/app/landing-page/dialog-service/oxalate/shared/alert/alert.component';

/**
 * The signed-in profile page and the pieces only it uses. It is loaded the first
 * time someone opens /profile, so visitors who never sign in do not download it.
 */
@NgModule({
  declarations: [
    ProfileComponent,
    ChangePasswordComponent,
    SaveItemsComponent,
    CoverColorDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    A11yModule,
    ColorSketchModule,
    ClickableDirective,
    AlertComponent,
    IconComponent,
    RouterModule.forChild([
      { path: '', component: ProfileComponent, title: 'Your profile' },
    ]),
  ],
})
export class ProfileModule {}
