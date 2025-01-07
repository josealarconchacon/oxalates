import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Benefit } from '../../model/benefit';

export interface BenefitsData {
  benefits: Benefit[];
}

@Injectable({
  providedIn: 'root',
})
export class BenefitsService {
  private jsonUrl = '../../../../assets/mock-oxalate/benefits.json';

  constructor(private http: HttpClient) {}

  getBenefits(): Observable<BenefitsData> {
    return this.http.get<BenefitsData>(this.jsonUrl);
  }
}
export { Benefit };
