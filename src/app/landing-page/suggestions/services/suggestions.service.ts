import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment.development';

export interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

export interface SuggestionForm {
  title: string;
  description: string;
  category: string;
}

export interface SupportForm {
  name: string;
  email: string;
  issueType: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class SuggestionsService {
  private apiUrl = environment.firebaseConfig;

  constructor(private http: HttpClient) {}

  submitSuggestion(suggestion: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submitSuggestion`, suggestion);
  }

  private commonFaqs: FAQ[] = [
    {
      question: 'How do I track my daily oxalate intake?',
      answer:
        'You can use the Calculate Daily Intake feature in the app. Simply log in, go to the "Calculate Daily Intake" page, and click on "+ Add Food" to start tracking.',
      isOpen: false,
    },
    {
      question: 'How accurate is the oxalate content data?',
      answer:
        'Our data is sourced from peer-reviewed scientific studies and regularly updated. However, oxalate content can vary based on growing conditions and preparation methods.',
      isOpen: false,
    },
    {
      question: 'Can I export my tracking data?',
      answer:
        'Yes, you can export your data in CSV format from the "Calculate Daily Intake" page. Switch between days, or top on the calendar button to select the day and data you want to export. This feature is available for all registered users.',
      isOpen: false,
    },
    {
      question: 'How do I update my account information?',
      answer:
        'Go to your profile settings by clicking on your avatar in the top right corner. From there, you can update your personal information and preferences.',
      isOpen: false,
    },
  ];

  getFaqs(): Observable<FAQ[]> {
    return of(this.commonFaqs);
  }

  // submitSuggestion(suggestion: SuggestionForm): Observable<boolean> {
  //   // Here you would typically make an HTTP call to your backend
  //   console.log('Suggestion submitted:', suggestion);
  //   return of(true);
  // }

  submitSupport(support: SupportForm): Observable<boolean> {
    // Here you would typically make an HTTP call to your backend
    console.log('Support request submitted:', support);
    return of(true);
  }
}
