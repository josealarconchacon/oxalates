import { Component, OnInit } from '@angular/core';
import { Benefit, BenefitsService } from './service/benefits.service';
import { IconName } from '../../shared/components/icon/icon.component';

/** Line icon per benefit, matched by title; unknown titles get a leaf. */
const BENEFIT_ICONS: Record<string, IconName> = {
  'Risk of Kidney Stones': 'shield-check',
  'Better Mineral Absorption': 'gem',
  'Less Gut Distress': 'activity',
  'Better Management of Chronic Conditions': 'heart',
  'Low Oxalate Help For People With Kidney Disease': 'funnel',
};

@Component({
  selector: 'app-benefits',
  templateUrl: './benefits.component.html',
  styleUrls: ['./benefits.component.css'],
  standalone: false,
})
export class BenefitsComponent implements OnInit {
  benefits: Benefit[] = [];

  constructor(private benefitsService: BenefitsService) {}

  iconFor(title: string): IconName {
    return BENEFIT_ICONS[title] ?? 'leaf';
  }

  /** "01", "02", … for the card corner. */
  cardNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  ngOnInit(): void {
    this.benefitsService.getBenefits().subscribe({
      next: (data) => {
        this.benefits = data.benefits;
      },
      error: (error) => {
        console.error('Error loading benefits:', error);
        this.benefits = [];
      },
    });
  }
}
