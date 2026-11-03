import { routes } from './app-routing.module';
import { authGuard } from './user-auth/service/auth.guard';
import { ProfileModule } from './user-auth/profile/profile.module';
import { FoodEntryComponent } from './user-auth/profile/food-entry/food-entry.component';

/**
 * The signed-in pages are lazy: their code is not in the first download. These
 * specs check each route still resolves to the right code and stays behind the
 * sign-in guard, since a typo in a lazy import only shows up when someone visits.
 */
describe('app routes for signed-in pages', () => {
  const route = (path: string) => routes.find((r) => r.path === path)!;

  it('loads the profile page lazily, behind the sign-in guard', async () => {
    const profile = route('profile');

    expect(profile.component).toBeUndefined();
    expect(profile.canActivate).toEqual([authGuard]);
    expect(await (profile.loadChildren as () => Promise<unknown>)()).toBe(
      ProfileModule
    );
  });

  it('loads the daily log lazily, behind the sign-in guard', async () => {
    const entry = route('food-entry');

    expect(entry.component).toBeUndefined();
    expect(entry.canActivate).toEqual([authGuard]);
    expect(entry.title).toBe('Daily oxalate log');
    expect(await (entry.loadComponent as () => Promise<unknown>)()).toBe(
      FoodEntryComponent
    );
  });
});
