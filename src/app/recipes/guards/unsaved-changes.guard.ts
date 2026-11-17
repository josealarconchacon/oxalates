import { CanDeactivateFn } from '@angular/router';

/** A page that may hold unsaved changes. */
export interface LeavesSafely {
  /** true to let the navigation go ahead (may ask the user first). */
  canLeave(): boolean | Promise<boolean>;
}

/** Asks before leaving a page with unsaved changes. */
export const unsavedChangesGuard: CanDeactivateFn<LeavesSafely> = (page) => page.canLeave();
