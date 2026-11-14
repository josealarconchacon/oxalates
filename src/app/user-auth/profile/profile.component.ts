import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AuthService,
  cleanDisplayName,
  displayNameError,
} from '../service/auth-service.service';
import { ProfileImageService } from '../service/profile-image.service';
import { Router } from '@angular/router';
import { fadeInOut } from 'src/app/shared/animations/fadeInOut';
import {
  isDarkColor,
  DEFAULT_BANNER_COLOR,
} from '../../shared/utils/color-utils';
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
  /** The picked banner is dark, so text drawn on it (iPad card) goes white. */
  bannerIsDark = false;
  firstName: string = '';
  lastName: string = '';

  activeSection$: Observable<string> | undefined;

  /** Name row: editing, the text being typed, saving, and what went wrong. */
  isEditingName = false;
  nameDraft = '';
  isSavingName = false;
  nameError: string | null = null;
  @ViewChild('nameInput') private nameInput?: ElementRef<HTMLInputElement>;
  @ViewChild('editNameButton') private editNameButton?: ElementRef<HTMLButtonElement>;

  constructor(
    private authService: AuthService,
    private profileImageService: ProfileImageService,
    private router: Router,
    private navigationService: NavigationService,
    private cdr: ChangeDetectorRef
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

  startEditName(): void {
    this.nameDraft = this.userProfile?.displayName ?? '';
    this.nameError = null;
    this.isEditingName = true;
    this.focusAfterRender(() => {
      const input = this.nameInput?.nativeElement;
      input?.focus();
      input?.select();
    });
  }

  /** Typing clears an old error; it's checked again on Save. */
  onNameInput(value: string): void {
    this.nameDraft = value;
    this.nameError = null;
  }

  cancelEditName(): void {
    if (this.isSavingName) return;
    this.isEditingName = false;
    this.nameError = null;
    this.focusAfterRender(() => this.editNameButton?.nativeElement.focus());
  }

  async saveName(): Promise<void> {
    if (this.isSavingName) return;
    // Check here first so a mistake shows at once, without a network call.
    this.nameError = displayNameError(cleanDisplayName(this.nameDraft));
    if (this.nameError) {
      this.focusAfterRender(() => this.nameInput?.nativeElement.focus());
      return;
    }
    this.isSavingName = true;
    try {
      // The page updates from the cached profile the service refreshes.
      await this.authService.updateDisplayName(this.nameDraft);
      this.isSavingName = false;
      this.cancelEditName();
    } catch {
      this.isSavingName = false;
      this.nameError = "Couldn't save your name. Please try again.";
      this.focusAfterRender(() => this.nameInput?.nativeElement.focus());
    }
  }

  /** Runs after the template has caught up (the input/button exists). */
  private focusAfterRender(focus: () => void): void {
    this.cdr.detectChanges();
    focus();
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
  }

  closeColorPicker(): void {
    this.isColorPickerVisible = false;
  }

  /** Save from the Choose Color dialog: store the pick and repaint the banner. */
  saveColor(color: string): void {
    if (color.toUpperCase() === DEFAULT_BANNER_COLOR) {
      // Back to the default: forget the pick so the banner follows the theme
      // (soft green in light mode, dark green-grey in dark mode).
      this.currentHeaderColor = null;
      this.bannerIsDark = false;
      localStorage.removeItem('headerColor');
    } else {
      this.currentHeaderColor = color;
      this.bannerIsDark = isDarkColor(color);
      localStorage.setItem('headerColor', color);
    }
    this.isColorPickerVisible = false;
  }

  onLogout(): void {
    this.authService.signOut();
  }

}
