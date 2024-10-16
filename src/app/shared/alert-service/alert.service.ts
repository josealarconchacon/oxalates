import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertSubject = new Subject<string>();

  showAlert(message: string) {
    console.log('Sending alert message:', message);
    this.alertSubject.next(message);
  }

  getAlertObservable(): Observable<string> {
    return this.alertSubject.asObservable();
  }

  closeAlert() {
    this.alertSubject.next('');
  }
}
