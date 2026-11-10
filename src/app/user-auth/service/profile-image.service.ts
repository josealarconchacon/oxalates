import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth-service.service';

/** Must match the size limit in storage.rules. */
export const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

@Injectable({
  providedIn: 'root',
})
export class ProfileImageService {
  constructor(
    private storage: AngularFireStorage,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  async upload(file: File): Promise<boolean> {
    if (!file.type.startsWith('image/')) {
      this.notify('Choose an image file (JPG, PNG, WebP or GIF).');
      return false;
    }
    if (file.size >= MAX_PROFILE_IMAGE_BYTES) {
      this.notify('Choose an image smaller than 5 MB.');
      return false;
    }

    try {
      const user = await this.authService.getCurrentUser();
      if (!user) {
        this.notify('Sign in again to change your photo.');
        return false;
      }
      // Each user's photos live under their own ID, so storage.rules can let
      // only the owner upload there.
      const path = `profile-images/${user.uid}/${Date.now()}_${file.name}`;
      await this.storage.upload(path, file);
      const url = await firstValueFrom(this.storage.ref(path).getDownloadURL());
      await this.authService.updateProfileImage(url);
      return true;
    } catch (error) {
      console.error('Error updating profile image:', error);
      this.notify(
        "We couldn't update your photo. Check your connection and try again.",
      );
      return false;
    }
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 10000,
      panelClass: 'app-snackbar',
    });
  }
}
