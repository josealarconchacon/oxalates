import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/landing-page/dialog-service/oxalate/service/notification.service';
import { FoodEntryService } from 'src/app/user-auth/profile/food-entry/service/food-entry.service';
import { calculateRecipe } from '../engine/recipe-calculator';
import { levelForMgPerServing } from '../engine/recipe-level';
import { custom, food, grams, lookup, recipe } from '../engine/testing/fixtures';
import { LoggedToastData } from '../pages/recipe-detail/log-serving/logged-toast.component';
import { LOG_TIMEOUT_MS, RecipeLogService } from './recipe-log.service';

describe('RecipeLogService', () => {
  let addToMeal: jasmine.Spy;
  let removeRecipeEntry: jasmine.Spy;
  let openFromComponent: jasmine.Spy;
  let navigate: jasmine.Spy;
  let toast: jasmine.Spy;
  let service: RecipeLogService;

  // 200 g carrot (10 mg/100 g), serves 2 → 10 mg per serving.
  const foods = lookup(food({ id: 'carrot', item: 'Carrot' }));
  const soup = { ...recipe([grams('carrot', 200, 'Carrot'), custom('Tapioca', 10)], 2), id: 'r1', name: 'Carrot soup' };
  const result = calculateRecipe(soup, foods, levelForMgPerServing);

  beforeEach(() => {
    addToMeal = jasmine.createSpy('addToMeal').and.resolveTo();
    removeRecipeEntry = jasmine.createSpy('removeRecipeEntry').and.resolveTo();
    openFromComponent = jasmine.createSpy('openFromComponent');
    navigate = jasmine.createSpy('navigate').and.resolveTo(true);
    toast = jasmine.createSpy('show');
    TestBed.configureTestingModule({
      providers: [
        { provide: FoodEntryService, useValue: { addToMeal, removeRecipeEntry } },
        { provide: MatSnackBar, useValue: { openFromComponent } },
        { provide: Router, useValue: { navigate } },
        { provide: NotificationService, useValue: { show: toast } },
      ],
    });
    service = TestBed.inject(RecipeLogService);
  });

  it('saves a snapshot entry (with food-style copies) into that day and meal', async () => {
    const logged = await service.log(soup, result, { dayKey: '2026-11-19', meal: 'dinner', multiplier: 2 });
    const [dayKey, meal, entry] = addToMeal.calls.mostRecent().args;
    expect(dayKey).toBe('2026-11-19');
    expect(meal).toBe('dinner');
    expect(entry).toEqual(
      jasmine.objectContaining({
        kind: 'recipe',
        foodName: 'Carrot soup',
        servingSize: 'recipe',
        numberOfServings: 2,
        oxalatePerServing: 10,
      })
    );
    expect(entry.snapshot).toEqual(
      jasmine.objectContaining({ recipeId: 'r1', recipeName: 'Carrot soup', multiplier: 2, mg: 20, incomplete: true })
    );
    expect(Object.isFrozen(entry.snapshot)).toBeFalse(); // a plain copy for Firestore
    expect(entry.entryId).toMatch(/\w{6,}/);
    expect(logged).toEqual({ dayKey: '2026-11-19', meal: 'dinner', entry });
  });

  it('each log gets its own entry id', async () => {
    const a = await service.log(soup, result, { dayKey: '2026-11-19', meal: 'lunch', multiplier: 1 });
    const b = await service.log(soup, result, { dayKey: '2026-11-19', meal: 'lunch', multiplier: 1 });
    expect(a.entry.entryId).not.toBe(b.entry.entryId);
  });

  it('a save that hangs fails after the timeout', fakeAsync(() => {
    addToMeal.and.returnValue(new Promise(() => {}));
    let failed = false;
    service.log(soup, result, { dayKey: '2026-11-19', meal: 'lunch', multiplier: 1 }).catch(() => (failed = true));
    tick(LOG_TIMEOUT_MS + 1);
    expect(failed).toBeTrue();
  }));

  describe('announce', () => {
    const logged = () => ({
      dayKey: '2026-11-19',
      meal: 'dinner' as const,
      entry: { entryId: 'e1' } as never,
    });
    const data = (): LoggedToastData => openFromComponent.calls.mostRecent().args[1].data;

    it('"Added to Dinner on Thu, Nov 19."; View day opens Daily Intake on that date', () => {
      service.announce(logged());
      expect(data().message).toBe('Added to Dinner on Thu, Nov 19.');
      data().viewDay();
      expect(navigate).toHaveBeenCalledWith(['/food-entry'], { queryParams: { date: '2026-11-19' } });
    });

    it('Undo removes exactly that entry and says so', async () => {
      service.announce(logged());
      await data().undo();
      expect(removeRecipeEntry).toHaveBeenCalledWith('2026-11-19', 'dinner', 'e1');
      expect(toast).toHaveBeenCalledWith('Removed from Dinner.', 'Close', ['success-snackbar']);
    });

    it("Undo that fails says where to remove it instead", async () => {
      removeRecipeEntry.and.rejectWith(new Error('offline'));
      service.announce(logged());
      await data().undo();
      expect(toast.calls.mostRecent().args[0]).toBe("We couldn't undo this. You can remove it in Calculate Daily Intake.");
    });
  });
});
