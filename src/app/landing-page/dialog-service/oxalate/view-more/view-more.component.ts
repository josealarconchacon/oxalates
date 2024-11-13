import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { OxalateService } from '../../service/oxalate.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OXALATE_INFO_FIELDS } from '../filter/model/oxalate-constants';

@Component({
  selector: 'app-view-more',
  templateUrl: './view-more.component.html',
  styleUrls: ['./view-more.component.css'],
})
export class ViewMoreComponent implements OnInit {
  @Input() oxalateData: Oxalate | undefined;
  savedItems: Oxalate[] = [];
  isSaving = false;
  OXALATE_INFO_FIELDS = OXALATE_INFO_FIELDS;

  constructor(
    private router: Router,
    private authService: AuthService,
    private oxalateService: OxalateService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();

    if (
      navigation?.extras.state &&
      navigation.extras.state['selectedOxalate']
    ) {
      this.oxalateData = navigation.extras.state['selectedOxalate'] as Oxalate;
      console.log('Received oxalate data:', this.oxalateData);
    } else {
      console.warn('No state data found for selected oxalate.');
    }

    this.authService
      .getCurrentUser()
      .then((user) => {
        if (user) {
          const userId = user.uid;
          this.oxalateService
            .getSavedOxalates(userId)
            .subscribe((savedOxalates: Oxalate[]) => {
              this.savedItems = savedOxalates;
            });
        } else {
          console.warn('No authenticated user found.');
          this.savedItems = [];
        }
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        this.savedItems = [];
      });
  }

  async onSave(): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser();

      if (!user) {
        this.authService.redirectToSignIn();
        return;
      }

      if (this.oxalateData) {
        const itemAlreadySaved = await this.oxalateService.itemExists(
          this.oxalateData,
          user.uid
        );

        if (itemAlreadySaved) {
          this.showNotification('Item already was saved!', 'error-snackbar');
          return;
        }

        this.isSaving = true;
        await this.oxalateService.saveOxalate(this.oxalateData);
        this.showNotification('Item saved successfully!', 'success-snackbar');
      } else {
        console.warn('No oxalate data available to save.');
      }
    } catch (error) {
      console.error('Error saving oxalate:', error);
      this.showNotification(
        'An error occurred while saving the item.',
        'error-snackbar'
      );
    } finally {
      this.isSaving = false;
    }
  }

  private showNotification(message: string, panelClass: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }
}
