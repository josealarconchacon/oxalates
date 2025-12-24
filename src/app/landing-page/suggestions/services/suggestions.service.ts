import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface CustomerFeedback {
  name: string;
  email: string;
  feedback: string;
}

@Injectable({
  providedIn: 'root',
})
export class SuggestionsService {
  submitFeedback(feedback: CustomerFeedback): Observable<boolean> {
    console.log('Customer feedback submitted:', feedback);
    return of(true);
  }
}
