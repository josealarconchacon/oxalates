import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  activeSectionSubject = new BehaviorSubject<string>('profile');
  activeSection$ = this.activeSectionSubject.asObservable();

  setActiveSection(section: string) {
    this.activeSectionSubject.next(section);
  }
}
