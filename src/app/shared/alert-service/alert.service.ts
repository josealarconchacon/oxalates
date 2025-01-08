import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertSubject = new Subject<{ message: string; show: boolean }>();

  showAlert(message: string) {
    console.log('Sending alert message:', message);
    this.alertSubject.next({ message, show: true });
  }

  closeAlert() {
    this.alertSubject.next({ message: '', show: false });
  }

  getAlertObservable(): Observable<{ message: string; show: boolean }> {
    return this.alertSubject.asObservable();
  }
}
