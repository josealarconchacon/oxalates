import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OxalateService {
  private jsonUrl = '../../../../assets/mock-oxalate/oxalate-content.json';

  constructor(private http: HttpClient) {}

  getOxalateContent(): Observable<any> {
    return this.http.get<any>(this.jsonUrl);
  }
}
