import { Component, OnInit } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { OxalateService } from 'src/app/landing-page/dialog-service/service/oxalate.service';
import { AuthService } from '../../service/auth-service.service';

@Component({
  selector: 'app-save-items',
  templateUrl: './save-items.component.html',
  styleUrls: ['./save-items.component.css'],
})
export class SaveItemsComponent implements OnInit {
  savedOxalates$: Observable<Oxalate[]> = of([]);
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
            tap((data) => console.log('Retrieved data:', data))
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
}
