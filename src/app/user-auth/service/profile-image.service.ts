import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth-service.service';

/**
 * The one way to change a profile photo. The file goes to Firebase Storage and
 * only its download URL is saved on the profile: Firebase Auth rejects a photo
 * URL longer than a couple of kilobytes, so a base64 copy of the image can
 * never be stored there.
 */
@Injectable({
  providedIn: 'root',
})
export class ProfileImageService {
  constructor(
    private storage: AngularFireStorage,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Returns true when the new photo is saved; otherwise tells the user and
   * returns false. The message is a snackbar because this runs from the header
   * and the profile page, and neither hosts an <app-alert>.
   */
  async upload(file: File): Promise<boolean> {
    if (!file.type.startsWith('image/')) {
      this.notify('Choose an image file (JPG, PNG, WebP or GIF).');
      return false;
    }

    try {
      const path = `profile-images/${Date.now()}_${file.name}`;
      await this.storage.upload(path, file);
      const url = await firstValueFrom(this.storage.ref(path).getDownloadURL());
      await this.authService.updateProfileImage(url);
      return true;
    } catch (error) {
      console.error('Error updating profile image:', error);
      this.notify(
        "We couldn't update your photo. Check your connection and try again."
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
