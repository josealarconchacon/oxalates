import { TestBed } from '@angular/core/testing';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth-service.service';
import { ProfileImageService } from './profile-image.service';

describe('ProfileImageService', () => {
  const DOWNLOAD_URL = 'https://storage.example.com/profile-images/1_photo.png';

  let service: ProfileImageService;
  let storage: {
    upload: jasmine.Spy;
    ref: jasmine.Spy;
  };
  let getDownloadURL: jasmine.Spy;
  let authService: { updateProfileImage: jasmine.Spy };
  let snackBar: { open: jasmine.Spy };

  const image = (name = 'photo.png', type = 'image/png') =>
    new File(['pixels'], name, { type });

  beforeEach(() => {
    getDownloadURL = jasmine
      .createSpy('getDownloadURL')
      .and.returnValue(of(DOWNLOAD_URL));
    storage = {
      upload: jasmine.createSpy('upload').and.resolveTo({}),
      ref: jasmine.createSpy('ref').and.returnValue({ getDownloadURL }),
    };
    authService = {
      updateProfileImage: jasmine
        .createSpy('updateProfileImage')
        .and.resolveTo(undefined),
    };
    snackBar = { open: jasmine.createSpy('open') };
    spyOn(console, 'error');

    TestBed.configureTestingModule({
      providers: [
        { provide: AngularFireStorage, useValue: storage },
        { provide: AuthService, useValue: authService },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
    service = TestBed.inject(ProfileImageService);
  });

  describe('a valid image', () => {
    it('is stored under profile-images and reported as saved', async () => {
      const file = image('me.png');

      const saved = await service.upload(file);

      const path = storage.upload.calls.mostRecent().args[0] as string;
      expect(path).toMatch(/^profile-images\/\d+_me\.png$/);
      expect(storage.upload.calls.mostRecent().args[1]).toBe(file);
      expect(saved).toBeTrue();
      expect(snackBar.open).not.toHaveBeenCalled();
    });

    it('saves only the Storage download URL on the profile', async () => {
      await service.upload(image());

      expect(storage.ref).toHaveBeenCalledWith(
        storage.upload.calls.mostRecent().args[0]
      );
      expect(authService.updateProfileImage).toHaveBeenCalledOnceWith(
        DOWNLOAD_URL
      );
    });

    it('never hands the profile an inline data: copy of the image', async () => {
      // Firebase Auth rejects a photoURL longer than a couple of kilobytes,
      // which is why the header's old base64 upload could not work.
      await service.upload(image());

      const saved = authService.updateProfileImage.calls.mostRecent()
        .args[0] as string;
      expect(saved.startsWith('data:')).toBeFalse();
      expect(saved.length).toBeLessThan(2000);
    });
  });

  describe('a file that is not an image', () => {
    it('is refused with a message and nothing is uploaded', async () => {
      const saved = await service.upload(image('notes.pdf', 'application/pdf'));

      expect(saved).toBeFalse();
      expect(storage.upload).not.toHaveBeenCalled();
      expect(authService.updateProfileImage).not.toHaveBeenCalled();
      expect(snackBar.open.calls.mostRecent().args[0]).toBe(
        'Choose an image file (JPG, PNG, WebP or GIF).'
      );
      expect(snackBar.open.calls.mostRecent().args[1]).toBe('Dismiss');
    });
  });

  describe('when something fails', () => {
    const MESSAGE =
      "We couldn't update your photo. Check your connection and try again.";

    it('tells the user when the upload fails, and saves nothing', async () => {
      storage.upload.and.rejectWith(new Error('network'));

      const saved = await service.upload(image());

      expect(saved).toBeFalse();
      expect(authService.updateProfileImage).not.toHaveBeenCalled();
      expect(snackBar.open.calls.mostRecent().args[0]).toBe(MESSAGE);
      expect(snackBar.open).toHaveBeenCalledTimes(1);
    });

    it('tells the user when the download URL cannot be read', async () => {
      getDownloadURL.and.returnValue(throwError(() => new Error('denied')));

      const saved = await service.upload(image());

      expect(saved).toBeFalse();
      expect(authService.updateProfileImage).not.toHaveBeenCalled();
      expect(snackBar.open.calls.mostRecent().args[0]).toBe(MESSAGE);
      expect(snackBar.open).toHaveBeenCalledTimes(1);
    });

    it('tells the user when saving the profile fails', async () => {
      authService.updateProfileImage.and.rejectWith(new Error('offline'));

      const saved = await service.upload(image());

      expect(saved).toBeFalse();
      expect(snackBar.open.calls.mostRecent().args[0]).toBe(MESSAGE);
      expect(snackBar.open).toHaveBeenCalledTimes(1);
    });
  });
});
