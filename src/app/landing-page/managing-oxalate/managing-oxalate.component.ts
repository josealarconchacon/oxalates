import { Component, OnInit } from '@angular/core';
import { OxalateService } from './service/oxalate.service';
import { IconName } from '../../shared/components/icon/icon.component';

/** Line icon per tip (the redesign); unknown titles get a leaf. */
const TIP_LINE_ICONS: Record<string, IconName> = {
  'Stay Hydrated': 'droplet',
  'Mineral Intake': 'gem',
  'Go Slowly': 'gauge',
  'Regular Monitoring': 'clipboard-list',
  Consultation: 'user',
  'Community Support': 'users',
};

interface Tip {
  title: string;
  description: string;
}

interface OxalateContent {
  title: string;
  description?: string;
  tips: Tip[];
  link: string;
  communitySupport: string;
}

@Component({
  selector: 'app-managing-oxalate',
  templateUrl: './managing-oxalate.component.html',
  styleUrls: ['./managing-oxalate.component.css'],
  standalone: false,
})
export class ManagingOxalateComponent implements OnInit {
  content: OxalateContent | null = null;

  constructor(private oxalateService: OxalateService) {}

  lineIconFor(title: string): IconName {
    return TIP_LINE_ICONS[title] ?? 'leaf';
  }

  /** "01", "02", … for the card corner. */
  cardNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  ngOnInit() {
    this.oxalateService.getOxalateContent().subscribe((data) => {
      if (data?.tips) {
        // Community Support is the 6th card; its text lives apart in the JSON.
        data.tips.push({
          title: 'Community Support',
          description: data.communitySupport,
        });
      }
      this.content = data;
    });
  }
}
