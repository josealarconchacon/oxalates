import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { OxalateService } from '../../service/oxalate.service';
import { NotificationService } from '../service/notification.service';
import { ThemeService } from 'src/app/shared/services/theme.service';
import { OXALATE_INFO_FIELDS } from '../filter/model/oxalate-constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-more',
  templateUrl: './view-more.component.html',
  styleUrls: ['./view-more.component.css'],
})
export class ViewMoreComponent implements OnInit, OnDestroy {
  @Input() oxalateData: Oxalate | undefined;
  savedItems: Oxalate[] = [];
  isSaving = false;
  isDarkTheme: boolean = false;

  OXALATE_INFO_FIELDS: { label: string; field: keyof Oxalate }[] =
    OXALATE_INFO_FIELDS;

  private themeSubscription: Subscription | null = null;

  // Fields that should be hidden
  private fieldsToHide: string[] = [
    // No longer hiding specific fields as we want to show all fields with valid data
  ];

  // Fields that should have special styling/highlighting
  private highlightFields: string[] = [
    'total_oxalate_mg_per_100g',
    'calc_oxalate_per_serving',
    'total_soluble_oxalate_mg_per_100g',
    'calc_soluble_mg_oxalate_per_serving',
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private oxalateService: OxalateService,
    private notificationService: NotificationService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadOxalateDataFromNavigation();
    this.loadSavedOxalatesForCurrentUser();

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.isDarkTheme$.subscribe(
      (isDark) => {
        this.isDarkTheme = isDark;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
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
    // Check for null, undefined, empty strings
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === 'unk' ||
      value === 'n/a' ||
      value === 'uncalculated'
    ) {
      return false;
    }

    // Check for numeric zero values (0 or 0.00)
    if (typeof value === 'number' && value === 0) {
      return false;
    }

    if (typeof value === 'string') {
      // Check for string numeric zero values like "0" or "0.00"
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue === 0) {
        return false;
      }

      // Check if it's just zero with decimals
      if (value.replace(/[0.]/g, '') === '') {
        return false;
      }
    }

    return true;
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

  onSave(): void {
    if (!this.oxalateData || this.isSaving) {
      return;
    }

    this.isSaving = true;

    this.authService
      .getCurrentUser()
      .then((user) => {
        if (user) {
          this.oxalateService
            .saveOxalate(this.oxalateData!)
            .then(() => {
              this.isSaving = false;
              this.notificationService.show(
                'Item added to favorites successfully!',
                'Close',
                ['success-snackbar']
              );
              this.loadSavedOxalatesForCurrentUser(); // Refresh the saved items
            })
            .catch((error) => {
              this.isSaving = false;
              console.error('Error saving oxalate:', error);
              this.notificationService.show(
                'Error adding item to favorites.',
                'Close',
                ['error-snackbar']
              );
            });
        } else {
          this.isSaving = false;
          console.warn('No authenticated user found for saving.');
          this.notificationService.show(
            'You must be logged in to save favorites.',
            'Close',
            ['error-snackbar']
          );
        }
      })
      .catch((error) => {
        this.isSaving = false;
        console.error('Error fetching user for saving:', error);
        this.notificationService.show('Authentication error.', 'Close', [
          'error-snackbar',
        ]);
      });
  }

  extractValueWithoutUnit(value: string): string {
    const match = value?.match(/^([\d.]+)\s*(\w+\/\w+)?$/);
    return match ? match[1] : value;
  }

  extractUnit(value: string): string {
    const match = value?.match(/^([\d.]+)\s*(\w+\/\w+)?$/);
    return match && match[2] ? match[2] : '';
  }

  // Methods to support enhanced UI

  getLevelPercentage(level: number): string {
    // This method is still needed for any other components that might reference it
    // but we'll return 0% since we're not showing the level bar
    return '0%';
  }

  getFieldClass(field: string): string {
    if (this.highlightFields.includes(field)) {
      return 'highlight-row';
    }
    return '';
  }

  getValueClass(field: string, value: any): string {
    if (field === 'level' || field === 'calc_level') {
      const levelValue = parseInt(value);
      if (levelValue <= 2) return 'value-low';
      if (levelValue <= 4) return 'value-medium';
      return 'value-high';
    }
    return '';
  }

  onClose(): void {
    // Navigate back or close dialog
    this.router.navigate(['/oxalates']);
  }

  // Methods to handle field hiding and cleaning

  shouldHideField(field: string): boolean {
    return this.fieldsToHide.includes(field);
  }

  shouldShowNotes(notes: string | undefined): boolean {
    if (!notes) return false;

    // Hide notes that only mention soluble oxalate calculations or levels
    if (notes.toLowerCase().includes('soluble oxalate calculation'))
      return false;
    if (notes.toLowerCase().includes('soluble oxalate levels not calculated'))
      return false;

    // If after cleaning there's no meaningful content left, don't show the notes
    const cleaned = this.getCleanedNotes(notes);
    return cleaned.trim().length > 0;
  }

  getCleanedNotes(notes: string | undefined): string {
    if (!notes) return '';

    // Remove any references to soluble oxalate calculations or levels
    // and also remove specific serving conversion text
    let cleaned = notes
      .replace(/\s*soluble oxalate calculation.*$/i, '')
      .replace(/\s*soluble oxalate levels not calculated\.?/i, '')
      .replace(/\s*1 tbsp \(envelope\) = 4 servings\.?/i, '')
      .trim();

    return cleaned;
  }
}
