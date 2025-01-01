import { Component, OnInit } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { OxalateService } from 'src/app/landing-page/dialog-service/service/oxalate.service';
import { AuthService } from '../../service/auth-service.service';

@Component({
  selector: 'app-save-items',
  templateUrl: './save-items.component.html',
  styleUrls: ['./save-items.component.css'],
})
export class SaveItemsComponent implements OnInit {
  savedOxalates$: Observable<Omit<Oxalate, 'notes' | 'reference'>[]> = of([]);
  expandedCardId: string | null = null;

  constructor(
    private oxalateService: OxalateService,
    private authService: AuthService
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
                // Remove 'notes', 'reference', 'n/a', 'uncalculated' fields and empty values
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
            tap((data) => console.log('Retrieved filtered data:', data))
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

  deleteOxalate(id: string): void {
    console.log('Attempting to delete oxalate with ID:', id);
    from(this.authService.getCurrentUser()).subscribe((user) => {
      if (user) {
        this.oxalateService
          .deleteOxalate(user.uid, id)
          .then(() => {
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
}
