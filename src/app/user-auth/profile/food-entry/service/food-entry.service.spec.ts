import { EnvironmentInjector, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, of } from 'rxjs';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import firebase from 'firebase/compat/app';
import { DailyFoodEntry, FoodEntryService, RecipeEntry } from './food-entry.service';

describe('FoodEntryService', () => {
  let service: FoodEntryService;
  let snapshot: DailyFoodEntry | undefined;
  let signedInUser: { uid: string } | null;
  let requestedPath: string[];
  let writes: { data: any; options: any }[];
  let stored: any;

  beforeEach(() => {
    snapshot = undefined;
    signedInUser = { uid: 'user-1' };
    requestedPath = [];
    writes = [];
    stored = undefined;

    // Like the real compat classes, these call inject() when created, so the
    // service must build them inside an injection context.
    const fakeDocument = (id: string): any => {
      inject(EnvironmentInjector);
      requestedPath.push(id);
      return {
        collection: (name: string) => fakeCollection(name),
        valueChanges: () => of(snapshot),
        set: (data: any, options: any) => {
          writes.push({ data, options });
          return Promise.resolve();
        },
        ref: { id },
      };
    };
    const fakeCollection = (name: string): any => {
      inject(EnvironmentInjector);
      requestedPath.push(name);
      return { doc: (id: string) => fakeDocument(id) };
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AngularFirestore,
          useValue: {
            collection: fakeCollection,
            firestore: {
              runTransaction: (fn: (tx: any) => Promise<void>) =>
                fn({
                  get: () => Promise.resolve({ data: () => stored }),
                  set: (_ref: any, data: any, options: any) => writes.push({ data, options }),
                }),
            },
          },
        },
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

  describe('recipe entries', () => {
    const entry = (entryId: string): RecipeEntry => ({
      kind: 'recipe',
      entryId,
      snapshot: {
        recipeId: 'r1',
        recipeName: 'Soup',
        multiplier: 1,
        mg: 5,
        solubleMg: 2,
        level: 'Low',
        incomplete: false,
        solubleIncomplete: false,
        ingredients: [],
        dataUpdatedAt: '2024-07-27',
        loggedAt: '2026-11-18T12:00:00.000Z',
      },
      foodName: 'Soup',
      servingSize: 'recipe',
      numberOfServings: 1,
      oxalatePerServing: 5,
      solubleOxalatePerServing: 2,
    });

    it('addToMeal appends to that day and meal without rewriting the others', async () => {
      await service.addToMeal('2026-11-14', 'dinner', entry('e1'));
      expect(requestedPath).toEqual(['foodEntries', 'user-1', 'entries', '2026-11-14']);
      expect(writes[0].options).toEqual({ merge: true });
      expect(writes[0].data.date).toBe('2026-11-14');
      expect(writes[0].data.dinner).toEqual(firebase.firestore.FieldValue.arrayUnion(entry('e1')));
      expect(Object.keys(writes[0].data)).toEqual(['date', 'dinner']);
    });

    it('removeRecipeEntry removes exactly that entry, even after the page added UI fields', async () => {
      const spinach = {
        foodName: 'Spinach',
        oxalatePerServing: 600,
        solubleOxalatePerServing: 300,
        servingSize: '1 cup',
        numberOfServings: 1,
      };
      stored = { dinner: [spinach, { ...entry('e1'), isExpanded: false }, entry('e2')] };
      await service.removeRecipeEntry('2026-11-14', 'dinner', 'e1');
      expect(writes[0].data.dinner).toEqual([spinach, entry('e2')]);
    });

    it('removeRecipeEntry writes nothing when the entry is already gone', async () => {
      stored = { dinner: [entry('e2')] };
      await service.removeRecipeEntry('2026-11-14', 'dinner', 'e1');
      expect(writes).toEqual([]);
    });
  });
});
