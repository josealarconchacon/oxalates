import { EnvironmentInjector, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, of } from 'rxjs';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { DailyFoodEntry, FoodEntryService } from './food-entry.service';

describe('FoodEntryService', () => {
  let service: FoodEntryService;
  let snapshot: DailyFoodEntry | undefined;
  let signedInUser: { uid: string } | null;
  let requestedPath: string[];

  beforeEach(() => {
    snapshot = undefined;
    signedInUser = { uid: 'user-1' };
    requestedPath = [];

    // Like the real compat classes, these call inject() when created, so the
    // service must build them inside an injection context.
    const fakeDocument = (id: string): any => {
      inject(EnvironmentInjector);
      requestedPath.push(id);
      return {
        collection: (name: string) => fakeCollection(name),
        valueChanges: () => of(snapshot),
      };
    };
    const fakeCollection = (name: string): any => {
      inject(EnvironmentInjector);
      requestedPath.push(name);
      return { doc: (id: string) => fakeDocument(id) };
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AngularFirestore, useValue: { collection: fakeCollection } },
        {
          provide: AuthService,
          useValue: { getCurrentUser: () => Promise.resolve(signedInUser) },
        },
      ],
    });
    service = TestBed.inject(FoodEntryService);
  });

  const day = new Date('2026-11-05T00:00:00Z');

  it("reads the signed-in user's entry for that day", async () => {
    snapshot = {
      date: '2026-11-05',
      breakfast: [
        {
          foodName: 'Spinach',
          oxalatePerServing: 600,
          solubleOxalatePerServing: 300,
          servingSize: '1 cup',
          numberOfServings: 1,
        },
      ],
      lunch: [],
      dinner: [],
      snacks: [],
    };

    const entry = await firstValueFrom(service.getDailyEntry(day));

    expect(entry).toEqual(snapshot);
    expect(requestedPath).toEqual([
      'foodEntries',
      'user-1',
      'entries',
      '2026-11-05',
    ]);
  });

  it('returns an empty day when there is no document yet', async () => {
    const entry = await firstValueFrom(service.getDailyEntry(day));

    expect(entry).toEqual({
      date: '2026-11-05',
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    });
  });

  it('errors with "No user found" when nobody is signed in', async () => {
    signedInUser = null;

    await expectAsync(
      firstValueFrom(service.getDailyEntry(day))
    ).toBeRejectedWithError('No user found');
  });
});
