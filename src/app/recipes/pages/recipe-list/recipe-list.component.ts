import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';
import { RecipeFoodsService } from '../../data/recipe-foods.service';
import { RecipeService } from '../../data/recipe.service';
import { calculateRecipe } from '../../engine/recipe-calculator';
import { levelForMgPerServing } from '../../engine/recipe-level';
import {
  DEFAULT_SORT,
  ListItem,
  SORT_OPTIONS,
  SortKey,
  countLine,
  isSortKey,
  matchTagOptions,
  paramsFromView,
  tagOptions,
  toListItem,
  viewFromParams,
  visibleItems,
} from './list-query';
import { RecipeCardComponent } from './recipe-card/recipe-card.component';
import { RecipeRowComponent } from './recipe-row/recipe-row.component';

/** Search waits this long after the last key press. */
export const SEARCH_DEBOUNCE_MS = 200;
/** Last sort used, per user (the URL wins when it has one). */
export const SORT_STORAGE_KEY = 'recipes-list-sort:';

/** /recipes: your recipes, with search, sort and tag filters. */
@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [RouterLink, IconComponent, RecipeCardComponent, RecipeRowComponent],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css',
})
export class RecipeListComponent implements OnInit {
  private recipes = inject(RecipeService);
  private foods = inject(RecipeFoodsService);
  private breakpoints = inject(BreakpointObserver);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  state: 'loading' | 'error' | 'ready' = 'loading';
  /** Every recipe, with its engine result worked out once per load. */
  items: ListItem[] = [];
  /** What the list shows: matches, in the chosen order. Recomputed only when something changes. */
  visible: ListItem[] = [];
  /** ≤ 640px: compact rows instead of cards (only one of them is in the page). */
  phone = false;
  readonly cardSkeletons = [1, 2, 3, 4, 5, 6];
  readonly rowSkeletons = [1, 2, 3];
  readonly sortOptions = SORT_OPTIONS;

  /** What's typed in the search box; `appliedQuery` is what the list uses (debounced). */
  query = '';
  appliedQuery = '';
  sort: SortKey = DEFAULT_SORT;
  /** Chosen tag chips; a recipe must have ALL of them. Empty = "All". */
  selectedTags: string[] = [];
  /** The six suggested tags, then your own (worked out once per load). */
  tags: string[] = [];
  private typed$ = new Subject<string>();
  /** Tags from the URL, kept until the chips are known (after loading). */
  private urlTags: string[] = [];
  /** The URL didn't name a sort, so the remembered one may apply. */
  private urlHasSort = false;

  ngOnInit(): void {
    this.breakpoints
      .observe('(max-width: 640px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => (this.phone = state.matches));
    this.typed$.pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed(this.destroyRef)).subscribe((q) => {
      this.appliedQuery = q;
      this.refresh();
      this.writeUrl();
    });
    // The URL holds the view (?q=&sort=&tags=), so Back, refresh and shared links keep it.
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const view = viewFromParams((k) => params.get(k), (k) => params.getAll(k));
      this.query = this.appliedQuery = view.q;
      this.urlHasSort = view.sort !== null;
      if (view.sort) this.sort = view.sort;
      else if (this.state === 'ready') this.sort = this.rememberedSort() ?? DEFAULT_SORT;
      this.urlTags = view.tags;
      if (this.state === 'ready') {
        this.selectedTags = matchTagOptions(this.urlTags, this.tags);
        this.refresh();
      }
    });
    void this.load();
  }

  async load(): Promise<void> {
    this.state = 'loading';
    try {
      const [recipes, getFood] = await Promise.all([
        this.recipes.list(),
        firstValueFrom(this.foods.lookup$),
      ]);
      this.items = recipes.map((recipe) => toListItem(recipe, calculateRecipe(recipe, getFood, levelForMgPerServing)));
      this.tags = tagOptions(this.items);
      this.selectedTags = matchTagOptions(this.urlTags, this.tags);
      if (!this.urlHasSort) this.sort = this.rememberedSort() ?? this.sort;
      this.refresh();
      this.state = 'ready';
    } catch {
      this.state = 'error';
    }
  }

  /** "6 recipes · sorted by oxalate per serving" (announced politely as it changes). */
  get count(): string {
    return countLine(this.visible.length, this.sort);
  }

  onSearch(text: string): void {
    this.query = text;
    this.typed$.next(text);
  }

  onSort(value: string): void {
    if (!isSortKey(value)) return;
    this.sort = value;
    this.rememberSort(value);
    this.refresh();
    this.writeUrl();
  }

  isSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  toggleTag(tag: string): void {
    this.selectedTags = this.isSelected(tag) ? this.selectedTags.filter((t) => t !== tag) : [...this.selectedTags, tag];
    this.refresh();
    this.writeUrl();
  }

  /** No matches → "Clear filters": empties the search and the tags (the sort stays). */
  clearFilters(): void {
    this.query = this.appliedQuery = '';
    this.selectedTags = [];
    this.refresh();
    this.writeUrl();
  }

  /** "All" clears the tag filters. */
  clearTags(): void {
    this.selectedTags = [];
    this.refresh();
    this.writeUrl();
  }

  private refresh(): void {
    this.visible = visibleItems(this.items, this.appliedQuery, this.sort, this.selectedTags);
  }

  /** Replaces the URL (no new history entry per key press or chip). */
  private writeUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: paramsFromView({ q: this.appliedQuery, sort: this.sort, tags: this.selectedTags }),
      replaceUrl: true,
    });
  }

  private get storageKey(): string | null {
    const uid = this.items[0]?.recipe.ownerId;
    return uid ? SORT_STORAGE_KEY + uid : null;
  }

  private rememberedSort(): SortKey | null {
    try {
      const saved = this.storageKey && localStorage.getItem(this.storageKey);
      return isSortKey(saved) ? saved : null;
    } catch {
      return null;
    }
  }

  private rememberSort(sort: SortKey): void {
    try {
      if (this.storageKey) localStorage.setItem(this.storageKey, sort);
    } catch {
      // Private mode or storage full: the sort still works for this visit.
    }
  }
}
