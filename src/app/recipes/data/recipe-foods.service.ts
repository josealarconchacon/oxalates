import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { OxalateService } from 'src/app/landing-page/dialog-service/service/oxalate.service';
import { FoodLookup } from '../engine/recipe-calculator';

/** The food list as an id → food lookup for the recipe engine. Loaded once. */
@Injectable({ providedIn: 'root' })
export class RecipeFoodsService {
  private oxalates = inject(OxalateService);

  readonly lookup$: Observable<FoodLookup> = this.oxalates.getOxalateData().pipe(
    map((foods) => {
      const byId = new Map(foods.map((f) => [String(f.id), f]));
      return (id: string) => byId.get(id);
    }),
    shareReplay(1)
  );
}
