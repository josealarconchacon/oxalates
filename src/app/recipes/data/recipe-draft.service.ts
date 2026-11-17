import { Injectable } from '@angular/core';
import { RecipeIngredient } from '../model/recipe';

/** Unsaved builder contents, kept in this browser until the recipe saves. */
export interface RecipeLocalDraft {
  name: string;
  serves: number | null;
  notes: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  savedAt: string;
}

/** localStorage drafts, one per recipe id (or "new"). */
@Injectable({ providedIn: 'root' })
export class RecipeDraftService {
  load(recipeId: string | null): RecipeLocalDraft | null {
    try {
      const raw = localStorage.getItem(key(recipeId));
      const draft = raw ? (JSON.parse(raw) as RecipeLocalDraft) : null;
      return draft && Array.isArray(draft.ingredients) && Array.isArray(draft.tags) ? draft : null;
    } catch {
      return null; // unreadable: ignore it
    }
  }

  save(recipeId: string | null, draft: Omit<RecipeLocalDraft, 'savedAt'>, now = new Date()): void {
    try {
      localStorage.setItem(key(recipeId), JSON.stringify({ ...draft, savedAt: now.toISOString() }));
    } catch {
      // Storage full or blocked: the draft is a convenience, not required.
    }
  }

  clear(recipeId: string | null): void {
    localStorage.removeItem(key(recipeId));
  }
}

function key(recipeId: string | null): string {
  return `recipe-draft:${recipeId ?? 'new'}`;
}
