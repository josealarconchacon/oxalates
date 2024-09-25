import { Component, OnInit } from '@angular/core';
import { Benefit, BenefitsService } from './service/benefits.service';

@Component({
  selector: 'app-benefits',
  templateUrl: './benefits.component.html',
  styleUrls: ['./benefits.component.css'],
})
export class BenefitsComponent implements OnInit {
  benefits: Benefit[] = [];

  constructor(private benefitsService: BenefitsService) {}

  ngOnInit(): void {
    this.benefitsService.getBenefits().subscribe((data) => {
      this.benefits = data.benefits;
    });
  }
}
