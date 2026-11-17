import {
  EnvironmentInjector,
  Injectable,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/user-auth/service/auth-service.service';
import { Recipe } from '../model/recipe';

/** What the builder edits; the service adds id, owner and dates. */
export type RecipeDraft = Pick<Recipe, 'name' | 'serves' | 'ingredients' | 'notes' | 'tags'> &
  Partial<Pick<Recipe, 'photoUrl'>>;

/** The signed-in user's recipes, in recipes/{uid}/items/{recipeId}. */
@Injectable({ providedIn: 'root' })
export class RecipeService {
  private firestore = inject(AngularFirestore);
  private auth = inject(AuthService);
  private injector = inject(EnvironmentInjector);

  /** Newest first (by last change). */
  async list(): Promise<Recipe[]> {
    const snapshot = await firstValueFrom(this.items(await this.uid()).get());
    return snapshot.docs
      .map((doc) => ({ ...(doc.data() as Recipe), id: doc.id }))
      .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  }

  /** null when there's no such recipe for this user. */
  async get(id: string): Promise<Recipe | null> {
    const uid = await this.uid();
    const snapshot = await firstValueFrom(this.item(uid, id).get());
    return snapshot.exists ? { ...(snapshot.data() as Recipe), id } : null;
  }

  async create(draft: RecipeDraft, now = new Date()): Promise<Recipe> {
    const uid = await this.uid();
    const id = this.firestore.createId();
    const at = now.toISOString();
    const recipe: Recipe = { ...draft, id, ownerId: uid, createdAt: at, updatedAt: at };
    await this.item(uid, id).set(withoutUndefined(recipe));
    return recipe;
  }

  async update(recipe: Recipe, now = new Date()): Promise<Recipe> {
    const uid = await this.uid();
    const updated: Recipe = { ...recipe, ownerId: uid, updatedAt: now.toISOString() };
    await this.item(uid, recipe.id).set(withoutUndefined(updated));
    return updated;
  }

  async remove(id: string): Promise<void> {
    const uid = await this.uid();
    await this.item(uid, id).delete();
  }

  private async uid(): Promise<string> {
    const user = await this.auth.getCurrentUser();
    if (!user) throw new Error('Not signed in');
    return user.uid;
  }

  // AngularFire's compat classes must be created in an injection context.
  private items(uid: string) {
    return runInInjectionContext(this.injector, () =>
      this.firestore.collection('recipes').doc(uid).collection('items')
    );
  }

  private item(uid: string, id: string) {
    return runInInjectionContext(this.injector, () => this.items(uid).doc(id));
  }
}

/** Firestore rejects undefined fields (e.g. an optional photoUrl). */
function withoutUndefined<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
