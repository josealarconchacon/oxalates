import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth-service.service';
import { ProfileImageService } from '../service/profile-image.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { fadeInOut } from 'src/app/shared/animations/fadeInOut';
import {
  presetColors,
  colorToHex,
  isDarkColor,
} from '../../shared/utils/color-utils';
import { HSLA, HSVA, RGBA } from 'ngx-color';
import { HeaderComponent } from 'src/app/landing-page/header/header.component';
import { Observable } from 'rxjs';
import { NavigationService } from '../service/navigation.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ThemeService } from '../../shared/services/theme.service';

import { showDefaultAvatar } from 'src/app/shared/utils/avatar';

/** Banner color until the user picks one (light theme's --color-hero-panel). */
const DEFAULT_HEADER_COLOR = '#eaefe9';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  animations: [fadeInOut],
  standalone: false,
})
export class ProfileComponent implements OnInit {
  userProfile: any;
  isChangePasswordVisible: boolean = false;
  isColorPickerVisible: boolean = false;
  /** The banner color the user picked; null shows the theme's soft green. */
  currentHeaderColor: string | null = null;
  selectedColor: string = DEFAULT_HEADER_COLOR;
  /** The picked banner is dark, so text drawn on it (iPad card) goes white. */
  bannerIsDark = false;
  firstName: string = '';
  lastName: string = '';

  activeSection$: Observable<string> | undefined;
  isMobile$: Observable<boolean> | undefined;
  isDarkTheme$: Observable<boolean>;

  presetColors: string[] = presetColors;

  constructor(
    private authService: AuthService,
    private profileImageService: ProfileImageService,
    private router: Router,
    private navigationService: NavigationService,
    private breakpointObserver: BreakpointObserver,
    private themeService: ThemeService
  ) {
    this.activeSection$ = this.navigationService.activeSection$;
    this.isMobile$ = this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map((result) => result.matches));
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
    } else {
      this.getUserInfo();
    }
    const savedColor = localStorage.getItem('headerColor');
    if (savedColor) {
      this.currentHeaderColor = savedColor;
      this.selectedColor = savedColor;
      this.bannerIsDark = isDarkColor(savedColor);
    }
  }
  setActiveSection(section: string): void {
    this.navigationService.setActiveSection(section);
  }
  getUserInfo() {
    this.authService.getUserProfile().subscribe((response) => {
      this.userProfile = response;
      this.splitDisplayName();
    });
  }

  splitDisplayName() {
    if (this.userProfile?.displayName) {
      const nameParts = this.userProfile.displayName.split(' ');
      this.firstName = nameParts[0];
      this.lastName = nameParts.slice(1).join(' ');
    } else {
      this.firstName = 'First Name';
      this.lastName = 'Last Name';
    }
  }

  toggleChangePassword(): void {
    this.isChangePasswordVisible = !this.isChangePasswordVisible;
  }

  /** Falls back to the default avatar when the stored photo can't be shown. */
  onAvatarError = showDefaultAvatar;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // Clear the input so choosing the same file again still fires a change.
    input.value = '';
    if (file) {
      void this.profileImageService.upload(file);
    }
  }

  toggleColorPicker(): void {
    this.isColorPickerVisible = !this.isColorPickerVisible;
    if (this.isColorPickerVisible) {
      this.selectedColor = this.currentHeaderColor ?? DEFAULT_HEADER_COLOR;
    }
  }

  onColorSelect(color: string | HSLA | HSVA | RGBA): void {
    if (typeof color === 'string') {
      this.selectedColor = color;
    } else {
      this.selectedColor = colorToHex(color) || '#000000';
    }
  }

  saveColor(): void {
    this.currentHeaderColor = this.selectedColor;
    this.bannerIsDark = isDarkColor(this.selectedColor);
    localStorage.setItem('headerColor', this.currentHeaderColor);
    this.isColorPickerVisible = false;
  }

  cancelColor(): void {
    this.selectedColor = this.currentHeaderColor ?? DEFAULT_HEADER_COLOR;
    this.isColorPickerVisible = false;
  }

  onBackdropClick(event: MouseEvent): void {
    if (
      (event.target as HTMLElement).classList.contains('color-picker-backdrop')
    ) {
      this.cancelColor();
    }
  }

  onLogout(): void {
    this.authService.signOut();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
