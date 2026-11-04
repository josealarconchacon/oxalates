import { EnvironmentInjector, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, of } from 'rxjs';
import { AuthService } from './user-auth/service/auth-service.service';
import { FoodEntryService } from './user-auth/profile/food-entry/service/food-entry.service';
import { OxalateService } from './landing-page/dialog-service/service/oxalate.service';

describe('Firestore references are created inside an injection context', () => {
  const fakeDocument = (): any => {
    inject(EnvironmentInjector);
    return {
      collection: () => fakeCollection(),
      get: () => of({ exists: true, data: () => ({}) }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve(),
      valueChanges: () => of(null),
    };
  };

  const fakeCollection = (): any => {
    inject(EnvironmentInjector);
    return {
      doc: () => fakeDocument(),
      get: () => of({ empty: true, docs: [] }),
      add: () => Promise.resolve({ id: 'new-id' }),
      ref: { get: () => Promise.resolve({ docs: [] }) },
    };
  };

  const signedInUser = {
    uid: 'user-1',
    updateProfile: () => Promise.resolve(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AngularFirestore, useValue: { collection: fakeCollection } },
        {
          provide: AngularFireAuth,
          useValue: {
            authState: of(signedInUser),
            currentUser: Promise.resolve(signedInUser),
          },
        },
      ],
    });
  });

  afterEach(() => localStorage.removeItem('user'));

  it('lets AuthService load the profile when someone is signed in', async () => {
    const auth = TestBed.inject(AuthService);

    // The constructor's auth listener reads the user document after an await.
    await new Promise((resolve) => setTimeout(resolve));

    expect(auth.userProfile$).toBeDefined();
    await expectAsync(
      auth.updateProfileImage('https://x.test/a.png'),
    ).toBeResolved();
  });

  it('lets OxalateService read, save and delete saved foods', async () => {
    const service = TestBed.inject(OxalateService);
    const item = { item: 'Spinach' } as any;

    expect(await firstValueFrom(service.getSavedOxalates('user-1'))).toEqual(
      [],
    );
    expect(await service.itemExists(item, 'user-1')).toBeFalse();
    await expectAsync(service.deleteOxalate('user-1', 'a')).toBeResolved();
    await expectAsync(service.saveOxalate(item)).toBeResolved();
  });

  it('lets FoodEntryService read and write the daily log', async () => {
    const service = TestBed.inject(FoodEntryService);

    const entry = await firstValueFrom(service.getDailyEntry(new Date()));
    expect(entry?.breakfast).toEqual([]);
    await expectAsync(
      service.updateMealItems(new Date(), 'lunch', []),
    ).toBeResolved();
  });
});
