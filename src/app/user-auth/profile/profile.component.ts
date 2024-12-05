import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth-service.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  activeSection: string = 'profile';
  userProfile: any;
  isChangePasswordVisible: boolean = false;
  isSidebarCollapsed: boolean = false;
  selectedFile: File | null = null;

  constructor(
    private authService: AuthService,
    private storage: AngularFireStorage,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
    } else {
      this.getUserInfo();
    }
  }
  getUserInfo() {
    this.authService.getUserProfile().subscribe((response) => {
      this.userProfile = response;
      console.log('User Profile: ', this.userProfile); // Check if photoURL is present
    });
  }

  showSection(section: string): void {
    this.activeSection = section;
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

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onLogout(): void {
    this.authService.signOut();
  }
}
