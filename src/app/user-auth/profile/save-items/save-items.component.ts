import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { OxalateService } from 'src/app/landing-page/dialog-service/service/oxalate.service';
import { AuthService } from '../../service/auth-service.service';

/** Must match the phone media queries in the CSS. */
export const PHONE_QUERY = '(max-width: 640px)';

/** One label/value pair shown in the detail card. */
export interface DetailField {
  key: string;
  label: string;
  value: unknown;
  isMg: boolean;
}

/** Shown as the two big number tiles, when the food has them. */
const TILE_KEYS = [
  'total_oxalate_mg_per_100g',
  'calc_soluble_mg_oxalate_per_serving',
];

/** Order of the label/value list; any other field follows, A to Z. */
const FIELD_ORDER = [
  'item',
  'category',
  'level',
  'soluble_oxalate',
  'serving_size',
  'serving_g',
  'calc_oxalate_per_serving',
  'total_soluble_oxalate_mg_per_100g',
];

/** Not listed as fields: the id, and Calc Level (it's in the header). */
const HIDDEN_KEYS = ['id', 'calc_level'];

export type LevelTone = 'high' | 'medium' | 'low' | 'very-low' | 'neutral';

@Component({
  selector: 'app-save-items',
  templateUrl: './save-items.component.html',
  styleUrls: ['./save-items.component.css'],
  standalone: false,
})
export class SaveItemsComponent implements OnInit {
  savedOxalates$: Observable<Omit<Oxalate, 'notes' | 'reference'>[]> = of([]);
  expandedCardId: string | null = null;
  pendingDeleteId: string | null = null;

  /** Phones (≤640px) show the list as an accordion. Matches the CSS. */
  readonly isPhone = toSignal(
    inject(BreakpointObserver)
      .observe(PHONE_QUERY)
      .pipe(map((result) => result.matches)),
    { initialValue: false }
  );

  constructor(
    private oxalateService: OxalateService,
    private authService: AuthService,
    private host: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.loadSavedOxalates();
  }

  private loadSavedOxalates(): void {
    this.savedOxalates$ = from(this.authService.getCurrentUser()).pipe(
      switchMap((user) => {
        if (user) {
          const userId = user.uid;
          return from(this.oxalateService.getSavedOxalates(userId)).pipe(
            map((savedOxalates) =>
              savedOxalates.map((oxalate) => {
                const filteredOxalate = { ...oxalate };
                (
                  Object.keys(
                    filteredOxalate
                  ) as (keyof typeof filteredOxalate)[]
                ).forEach((key) => {
                  if (
                    key === 'notes' ||
                    key === 'reference' ||
                    filteredOxalate[key] === 'n/a' ||
                    filteredOxalate[key] === 'uncalculated' ||
                    !filteredOxalate[key]
                  ) {
                    delete filteredOxalate[key];
                  }
                });
                return filteredOxalate as Omit<Oxalate, 'notes' | 'reference'>;
              })
            ),
            tap((data) => {
              console.log('Fetched saved oxalates: .......');
            })
          );
        } else {
          return of([]);
        }
      }),
      catchError((error) => {
        console.error('Error fetching saved oxalates:', error);
        return of([]);
      })
    );
  }

  handleCardClick(id: string): void {
    this.expandedCardId = this.expandedCardId === id ? null : id;
  }

  formatKey(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  askDelete(id: string): void {
    this.pendingDeleteId = id;
    // Land on Cancel, the safe choice, so a stray Enter doesn't delete.
    this.focusVisible('.cancel-delete-button');
  }

  cancelDelete(): void {
    const id = this.pendingDeleteId;
    this.pendingDeleteId = null;
    this.focusVisible('.delete-button', (el) => el.dataset['deleteId'] === id);
  }

  // The list dropdown and the detail view both render the controls, and CSS
  // hides one of them, so focus the copy that is actually on screen.
  private focusVisible(
    selector: string,
    match: (el: HTMLElement) => boolean = () => true
  ): void {
    setTimeout(() => {
      Array.from(
        this.host.nativeElement.querySelectorAll<HTMLElement>(selector)
      )
        .find((el) => el.getClientRects().length > 0 && match(el))
        ?.focus();
    });
  }

  deleteOxalate(id: string): void {
    console.log('Attempting to delete oxalate with ID:', '...');
    from(this.authService.getCurrentUser()).subscribe((user) => {
      if (user) {
        this.oxalateService
          .deleteOxalate(user.uid, id)
          .then(() => {
            this.pendingDeleteId = null;
            if (this.expandedCardId === id) {
              this.expandedCardId = null;
            }
            this.loadSavedOxalates();
          })
          .catch((error) => {
            console.error('Error deleting oxalate:', error);
          });
      }
    });
  }

  isMeasurementKey(key: string): boolean {
    const measurementKeys = [
      'total_oxalate_mg_per_100g',
      'total_soluble_oxalate_mg_per_100g',
      'calc_oxalate_per_serving',
      'calc_soluble_mg_oxalate_per_serving',
    ];
    return measurementKeys.includes(key);
  }

  /** The big number tiles this food has (none, one or both). */
  statTiles(oxalate: object): DetailField[] {
    return TILE_KEYS.filter((key) => this.hasValue(oxalate, key)).map((key) =>
      this.toField(oxalate, key)
    );
  }

  /** Every other field the food has, in a fixed order. Nothing is dropped. */
  detailFields(oxalate: object): DetailField[] {
    const rank = (key: string) => {
      const i = FIELD_ORDER.indexOf(key);
      return i === -1 ? FIELD_ORDER.length : i;
    };
    return Object.keys(oxalate)
      .filter(
        (key) =>
          !HIDDEN_KEYS.includes(key) &&
          !TILE_KEYS.includes(key) &&
          this.hasValue(oxalate, key)
      )
      .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
      .map((key) => this.toField(oxalate, key));
  }

  private hasValue(oxalate: object, key: string): boolean {
    return !!(oxalate as Record<string, unknown>)[key];
  }

  private toField(oxalate: object, key: string): DetailField {
    return {
      key,
      label: this.formatKey(key),
      value: (oxalate as Record<string, unknown>)[key],
      isMg: this.isMeasurementKey(key),
    };
  }

  /** Which badge color a Calc Level gets; same groups as the search page. */
  levelTone(level: string): LevelTone {
    switch (String(level).trim().toLowerCase()) {
      case 'high':
      case 'very high':
      case 'extremely high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      case 'very low':
        return 'very-low';
      default:
        return 'neutral'; // e.g. the few foods with a number here
    }
  }

  getSubtitle(oxalate: Omit<Oxalate, 'notes' | 'reference'>): string {
    const totalOxalate = oxalate['total_oxalate_mg_per_100g'];
    return totalOxalate
      ? `Total Oxalate: ${totalOxalate} mg/100g`
      : 'No oxalate data';
  }
}
