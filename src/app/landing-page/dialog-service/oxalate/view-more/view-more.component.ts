import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { OxalateService } from '../../service/oxalate.service';
import { NotificationService } from '../service/notification.service';
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

  OXALATE_INFO_FIELDS: { label: string; field: keyof Oxalate }[] =
    OXALATE_INFO_FIELDS;

  constructor(
    private router: Router,
    private authService: AuthService,
    private oxalateService: OxalateService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // console.log('Oxalate Data on Init:', this.oxalateData);
    this.loadOxalateDataFromNavigation();
    this.loadSavedOxalatesForCurrentUser();
  }

  getFilteredFields(): {
    label: string;
    field: keyof Oxalate;
    unit?: string;
  }[] {
    if (!this.oxalateData) {
      return [];
    }
    return this.OXALATE_INFO_FIELDS.filter((field) =>
      this.isFieldValid(this.oxalateData![field.field])
    );
  }

  private isFieldValid(value: any): boolean {
    return (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== 'unk' &&
      value !== 'n/a' &&
      value !== 'uncalculated'
    );
  }

  private loadOxalateDataFromNavigation(): void {
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
  }

  private loadSavedOxalatesForCurrentUser(): void {
    this.authService
      .getCurrentUser()
      .then((user) => {
        if (user) {
          this.oxalateService
            .getSavedOxalates(user.uid)
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
          this.notificationService.show('Item already was saved!', 'Close', [
            'error-snackbar',
          ]);
          return;
        }

        this.isSaving = true;
        await this.oxalateService.saveOxalate(this.oxalateData);
        this.notificationService.show('Item saved successfully!', 'Close', [
          'success-snackbar',
        ]);
        this.savedItems.push(this.oxalateData);
        this.loadSavedOxalatesForCurrentUser();
      } else {
        console.warn('No oxalate data available to save.');
      }
    } catch (error) {
      console.error('Error saving oxalate:', error);
      this.notificationService.show(
        'An error occurred while saving the item.',
        'Close',
        ['error-snackbar']
      );
    } finally {
      this.isSaving = false;
    }
  }

  extractValueWithoutUnit(value: string): string {
    const match = value?.match(/^([\d.]+)\s*(\w+\/\w+)?$/);
    return match ? match[1] : value;
  }

  extractUnit(value: string): string {
    const match = value?.match(/^([\d.]+)\s*(\w+\/\w+)?$/);
    return match && match[2] ? match[2] : '';
  }
}
