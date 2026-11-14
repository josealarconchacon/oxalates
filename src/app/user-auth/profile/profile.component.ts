import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth-service.service';
import { ProfileImageService } from '../service/profile-image.service';
import { Router } from '@angular/router';
import { fadeInOut } from 'src/app/shared/animations/fadeInOut';
import {
  presetColors,
  colorToHex,
  isDarkColor,
  DEFAULT_BANNER_COLOR,
} from '../../shared/utils/color-utils';
import { HSLA, HSVA, RGBA } from 'ngx-color';
import { HeaderComponent } from 'src/app/landing-page/header/header.component';
import { Observable } from 'rxjs';
import { NavigationService } from '../service/navigation.service';

import { showDefaultAvatar } from 'src/app/shared/utils/avatar';

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
  selectedColor: string = DEFAULT_BANNER_COLOR;
  readonly defaultBannerColor = DEFAULT_BANNER_COLOR;
  /** The picked banner is dark, so text drawn on it (iPad card) goes white. */
  bannerIsDark = false;
  firstName: string = '';
  lastName: string = '';

  activeSection$: Observable<string> | undefined;

  presetColors: string[] = presetColors;

  constructor(
    private authService: AuthService,
    private profileImageService: ProfileImageService,
    private router: Router,
    private navigationService: NavigationService
  ) {
    this.activeSection$ = this.navigationService.activeSection$;
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

  /** "a@b.com" → { name: "a", domain: "@b.com" }, so the card can wrap at the @. */
  splitEmail(email: string): { name: string; domain: string } {
    const at = email.lastIndexOf('@');
    return at > 0
      ? { name: email.slice(0, at), domain: email.slice(at) }
      : { name: email, domain: '' };
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
      this.selectedColor = this.currentHeaderColor ?? DEFAULT_BANNER_COLOR;
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
    if (this.selectedColor.toUpperCase() === DEFAULT_BANNER_COLOR) {
      // Back to the default: forget the pick so the banner follows the theme
      // (soft green in light mode, dark green-grey in dark mode).
      this.currentHeaderColor = null;
      this.bannerIsDark = false;
      localStorage.removeItem('headerColor');
    } else {
      this.currentHeaderColor = this.selectedColor;
      this.bannerIsDark = isDarkColor(this.selectedColor);
      localStorage.setItem('headerColor', this.currentHeaderColor);
    }
    this.isColorPickerVisible = false;
  }

  cancelColor(): void {
    this.selectedColor = this.currentHeaderColor ?? DEFAULT_BANNER_COLOR;
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

}
