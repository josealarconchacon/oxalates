import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  HostListener,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { ThemeService } from '../shared/services/theme.service';
import { OxalateService } from './dialog-service/service/oxalate.service';
import { Oxalate } from './model/oxalate';
import { Subject, Subscription, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Router } from '@angular/router';
import { SearchInputComponent } from './dialog-service/oxalate/search-input/search-input.component';
import { FoodEntryService } from '../user-auth/profile/food-entry/service/food-entry.service';
import { AuthService } from '../user-auth/service/auth-service.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CalculateOxalateComponent } from '../user-auth/profile/calculate-oxalate/calculate-oxalate.component';
import { FoodItem } from '../user-auth/profile/food-entry/food-entry.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourcesComponent } from './resources/resources.component';
import { FoodByCategoryComponent } from './dialog-service/food-by-category/food-by-category.component';
import { ManagingOxalateComponent } from './managing-oxalate/managing-oxalate.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    SearchInputComponent,
    CalculateOxalateComponent,
    FormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LandingPageComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  @ViewChild('modalSearchInput') modalSearchInput!: SearchInputComponent;

  isDarkTheme$ = this.themeService.isDarkTheme$;
  searchQuery: string = '';
  showSearchResults: boolean = false;
  searchResults: Oxalate[] = [];
  isLoading: boolean = false;
  showFoodEntryModal: boolean = false;
  selectedFood: Oxalate | null = null;
  selectedMealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks' = 'breakfast';
  private searchSubject: Subject<string> = new Subject<string>();
  private subscriptions: Subscription[] = [];
  private lastQuery: string = '';
  private pendingFocus: boolean = false;
  private isMobile: boolean = false;

  constructor(
    private themeService: ThemeService,
    private oxalateService: OxalateService,
    private router: Router,
    private foodEntryService: FoodEntryService,
    private authService: AuthService,
    private afAuth: AngularFireAuth
  ) {
    this.checkMobileDevice();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobileDevice();
  }

  private checkMobileDevice() {
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.setupSearchSubscription();
  }

  ngAfterViewChecked() {
    if (this.pendingFocus && this.modalSearchInput) {
      this.focusModalSearchInput();
      this.pendingFocus = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private focusModalSearchInput() {
    // Use the public method on the search input component to focus the input
    if (this.modalSearchInput) {
      setTimeout(() => {
        this.modalSearchInput.focusInput();
      }, 0);
    }
  }

  private setupSearchSubscription(): void {
    this.subscriptions.push(
      this.searchSubject
        .pipe(
          tap(() => {
            if (
              this.searchQuery.trim() !== this.lastQuery &&
              this.searchQuery.trim() !== ''
            ) {
              this.isLoading = true;
            }
          }),
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((query) => {
            this.lastQuery = query.trim();
            if (!query.trim()) {
              return of([]);
            }
            return this.oxalateService.searchOxalateData(query);
          })
        )
        .subscribe({
          next: (data) => {
            this.searchResults = data;
            this.isLoading = false;
            if (this.showSearchResults) {
              this.pendingFocus = true;
            }
          },
          error: (error) => {
            console.error('Error searching oxalates:', error);
            this.isLoading = false;
          },
        })
    );
  }

  onRegister() {
    console.log('Register button clicked');
  }

  scrollToOxalate() {
    setTimeout(() => {
      const element = document.querySelector('app-oxalate');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  }

  onSearchQueryChange(query: string) {
    this.searchQuery = query;

    // For mobile devices, only show modal after 6 characters
    if (this.isMobile) {
      if (query.length >= 6 && !this.showSearchResults) {
        this.showSearchResults = true;
        this.pendingFocus = true;
      } else if (query.length < 6) {
        this.showSearchResults = false;
      }
    } else {
      // Desktop behavior remains the same
      if (!this.showSearchResults) {
        this.showSearchResults = true;
        this.pendingFocus = true;
      }
    }

    if (!query.trim()) {
      this.searchResults = [];
      this.isLoading = false;
      this.lastQuery = '';
    } else {
      if (query.trim() !== this.lastQuery) {
        this.searchSubject.next(query);
      }
    }
  }

  /**
   * Handle Enter key press to dismiss keyboard on mobile
   */
  onSearchEnterPressed() {
    if (this.isMobile) {
      // On mobile, when Done key is pressed, we want to keep the modal open
      // but allow the keyboard to be dismissed
      this.pendingFocus = false;
    }
  }

  onClearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.isLoading = false;
    this.lastQuery = '';
    this.showSearchResults = false;
    this.searchSubject.next('');
  }

  closeSearchResults() {
    this.showSearchResults = false;
  }

  viewOxalateDetails(oxalate: Oxalate) {
    // Navigate to oxalate details page with more parameters
    this.router.navigate(['/oxalate'], {
      queryParams: {
        search: oxalate.item,
        category: oxalate.category,
        level: oxalate.level || oxalate.calc_level,
        autoOpenDetails: 'true',
        itemId: oxalate.id,
        searchPreserved: 'true',
      },
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  openFoodEntryModal(food: Oxalate) {
    this.selectedFood = food;
    this.showFoodEntryModal = true;
    this.showSearchResults = false;
    this.searchQuery = '';
  }

  closeFoodEntryModal() {
    this.showFoodEntryModal = false;
    this.selectedFood = null;
  }

  async onMealLogged(foodItem: FoodItem) {
    try {
      const utcDate = this.convertToUTC(new Date());
      await this.foodEntryService.updateMealItems(
        utcDate,
        this.selectedMealType,
        [foodItem]
      );
      this.closeFoodEntryModal();
    } catch (error) {
      console.error('Error logging meal:', error);
    }
  }

  private convertToUTC(date: Date): Date {
    return new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      )
    );
  }
}
