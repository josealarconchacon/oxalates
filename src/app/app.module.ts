import { ContributionComponent } from './landing-page/contribution/contribution.component';
import { APP_INITIALIZER, NgModule, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import { environment } from 'src/environments/environment.development';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAnalyticsModule } from '@angular/fire/compat/analytics';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthMessageComponent } from './shared/components/auth-message/auth-message.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { HeaderComponent } from './landing-page/header/header.component';
import { OxalateComponent } from './landing-page/dialog-service/oxalate/oxalate.component';
import { FilterComponent } from './landing-page/dialog-service/oxalate/filter/filter.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FooterComponent } from './landing-page/footer/footer.component';
import { ResourcesComponent } from './landing-page/resources/resources.component';
import { BenefitsComponent } from './landing-page/benefits/benefits.component';
import { ManagingOxalateComponent } from './landing-page/managing-oxalate/managing-oxalate.component';
import { ViewMoreComponent } from './landing-page/dialog-service/oxalate/view-more/view-more.component';
import { AlertComponent } from './landing-page/dialog-service/oxalate/shared/alert/alert.component';
import { ConfigService } from 'src/assets/config/config.service';
import { AuthComponent } from './user-auth/auth/auth.component';
import { ProfileComponent } from './user-auth/profile/profile.component';
import { CommonModule } from '@angular/common';
import { ChangePasswordComponent } from './user-auth/change-password/change-password.component';
import { SaveItemsComponent } from './user-auth/profile/save-items/save-items.component';
import { AlertService } from './shared/alert-service/alert.service';
import { RouterModule } from '@angular/router';
import { ColorSketchModule } from 'ngx-color/sketch';
import { CalculateOxalateComponent } from './user-auth/profile/calculate-oxalate/calculate-oxalate.component';
import { FoodByCategoryComponent } from './landing-page/dialog-service/food-by-category/food-by-category.component';
import { SearchInputComponent } from './landing-page/dialog-service/oxalate/search-input/search-input.component';
import { SavedMealsComponent } from './user-auth/profile/calculate-oxalate/saved-meals/saved-meals.component';
import { FoodEntryComponent } from './user-auth/profile/food-entry/food-entry.component';
import { ThemeService } from './shared/services/theme.service';
import { BeCautiousComponent } from './landing-page/be-cautious/be-cautious.component';

export function initializeApp(configService: ConfigService) {
  return (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      configService.getConfig().subscribe(
        (config) => {
          // Set the Firebase configuration dynamically
          environment.firebaseConfig = config;
          resolve();
        },
        (error) => reject(error)
      );
    });
  };
}

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    OxalateComponent,
    FilterComponent,
    ResourcesComponent,
    BenefitsComponent,
    ManagingOxalateComponent,
    ViewMoreComponent,
    AlertComponent,
    AuthComponent,
    ProfileComponent,
    ChangePasswordComponent,
    SaveItemsComponent,
  ],

  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    MatExpansionModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAnalyticsModule,
    AngularFireAuthModule,
    ColorSketchModule,
    ColorSketchModule,
    CalculateOxalateComponent,
    FoodByCategoryComponent,
    SearchInputComponent,
    SavedMealsComponent,
    FoodEntryComponent,
    ContributionComponent,
    HeaderComponent,
    FooterComponent,
    AuthMessageComponent,
    BeCautiousComponent,
  ],
  providers: [
    ConfigService,
    AlertService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi()),
    ThemeService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule implements OnInit {
  constructor(private configService: ConfigService) {}
  ngOnInit() {
    this.configService.getConfig().subscribe(() => {
      console.log('Firebase configuration initialized');
    });
  }
}
