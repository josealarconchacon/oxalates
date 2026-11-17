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
}
