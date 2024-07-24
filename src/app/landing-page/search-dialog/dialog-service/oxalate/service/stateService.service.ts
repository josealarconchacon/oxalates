// state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  // private showOxalateComponentSubject = new BehaviorSubject<boolean>(false);
  // showOxalateComponent$ = this.showOxalateComponentSubject.asObservable();

  // showOxalateComponent(show: boolean) {
  //   this.showOxalateComponentSubject.next(show);
  // }

  private scrollSubject = new Subject<void>();
  scroll$ = this.scrollSubject.asObservable();

  triggerScroll() {
    this.scrollSubject.next();
  }
}
