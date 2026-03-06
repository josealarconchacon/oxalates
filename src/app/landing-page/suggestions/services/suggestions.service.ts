import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import emailjs from '@emailjs/browser';
import { environment } from 'src/environments/environment';

export interface CustomerFeedback {
  name: string;
  email: string;
  feedback: string;
}

@Injectable({
  providedIn: 'root',
})
export class SuggestionsService {
  submitFeedback(payload: CustomerFeedback): Observable<boolean> {
    const { serviceId, templateId, publicKey } = environment.emailJs;

    return new Observable<boolean>((subscriber) => {
      emailjs
        .send(serviceId, templateId, {
          name: payload.name,
          email: payload.email,
          message: payload.feedback,
        }, { publicKey })
        .then(
          () => {
            subscriber.next(true);
            subscriber.complete();
          },
          (error) => {
            subscriber.error(error);
          }
        );
    });
  }
}
