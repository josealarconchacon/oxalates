import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertSubject = new Subject<string>();

  getAlertObservable() {
    return this.alertSubject.asObservable();
  }

  showAlert(message: string) {
    this.alertSubject.next(message);
  }

  closeAlert() {
    this.alertSubject.next(''); // Clear the alert message to hide the alert
  }
}
