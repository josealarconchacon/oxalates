import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth-service.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { fadeInOut } from 'src/app/shared/animations/fadeInOut';
import { presetColors, colorToHex } from '../../shared/utils/color-utils';
import { HSLA, HSVA, RGBA } from 'ngx-color';
import { HeaderComponent } from 'src/app/landing-page/header/header.component';
import { Observable } from 'rxjs';
import { NavigationService } from '../service/navigation.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  animations: [fadeInOut],
})
export class ProfileComponent implements OnInit {
  activeSection: string = 'profile';
  userProfile: any;
  isChangePasswordVisible: boolean = false;
  selectedFile: File | null = null;
  isColorPickerVisible: boolean = false;
  currentHeaderColor: string = '#1da1f2';
  selectedColor: string = this.currentHeaderColor;
  firstName: string = '';
  lastName: string = '';

  activeSection$: Observable<string> | undefined;
  isMobile$: Observable<boolean> | undefined;
  isDarkTheme$: Observable<boolean>;

  presetColors: string[] = presetColors;

  constructor(
    private authService: AuthService,
    private storage: AngularFireStorage,
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

  showSection(section: string): void {
    this.activeSection = section;
    console.log('Active Section:', this.activeSection);
  }

  toggleChangePassword(): void {
    this.isChangePasswordVisible = !this.isChangePasswordVisible;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
    if (this.selectedFile) {
      this.uploadImage();
    }
  }

  uploadImage(): void {
    if (this.selectedFile) {
      const filePath = `profile-images/${Date.now()}_${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, this.selectedFile);

      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              this.authService.updateProfileImage(url).then(() => {
                // profile will be updated through subscription
              });
            });
          })
        )
        .subscribe();
    }
  }

  toggleColorPicker(): void {
    this.isColorPickerVisible = !this.isColorPickerVisible;
    if (this.isColorPickerVisible) {
      this.selectedColor = this.currentHeaderColor;
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
    localStorage.setItem('headerColor', this.currentHeaderColor);
    this.isColorPickerVisible = false;
  }

  cancelColor(): void {
    this.selectedColor = this.currentHeaderColor;
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
