import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  private dismissSubject = new Subject<string>();

  toasts$: Observable<Toast> = this.toastSubject.asObservable();
  dismiss$: Observable<string> = this.dismissSubject.asObservable();

  success(message: string, duration: number = 3000): void {
    this.show({
      id: this.generateId(),
      message,
      type: 'success',
      duration,
      dismissible: true,
    });
  }

  error(message: string, duration: number = 5000): void {
    this.show({
      id: this.generateId(),
      message,
      type: 'error',
      duration,
      dismissible: true,
    });
  }

  warning(message: string, duration: number = 4000): void {
    this.show({
      id: this.generateId(),
      message,
      type: 'warning',
      duration,
      dismissible: true,
    });
  }

  info(message: string, duration: number = 3000): void {
    this.show({
      id: this.generateId(),
      message,
      type: 'info',
      duration,
      dismissible: true,
    });
  }

  show(toast: Toast): void {
    this.toastSubject.next(toast);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, toast.duration);
    }
  }

  dismiss(toastId: string): void {
    this.dismissSubject.next(toastId);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
