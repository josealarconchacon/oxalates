import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

/**
 * The Recipes list's last view (?q=&sort=&tags=), so "← Recipes" on a recipe
 * page goes back to the list you came from, filters and all. Memory only:
 * it lasts until the tab is reloaded.
 */
@Injectable({ providedIn: 'root' })
export class ListViewMemoryService {
  private last: Params = {};

  /** Query params for a link back to the list ({} = plain /recipes). */
  get params(): Params {
    return this.last;
  }

  remember(params: Params): void {
    this.last = { ...params };
  }
}
