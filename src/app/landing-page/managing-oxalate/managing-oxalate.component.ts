import { Component, OnInit } from '@angular/core';
import { OxalateService } from './service/oxalate.service';

interface Tip {
  title: string;
  description: string;
  icon: string;
  iconClass: string;
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
})
export class ManagingOxalateComponent implements OnInit {
  content: OxalateContent | null = null;

  constructor(private oxalateService: OxalateService) {}

  ngOnInit() {
    this.oxalateService.getOxalateContent().subscribe((data) => {
      if (data?.tips) {
        // Map specific icons and colors to each tip based on its title
        const tipIcons: { [key: string]: { icon: string; class: string } } = {
          'Stay Hydrated': { icon: 'water_drop', class: 'icon-water' },
          'Calcium Intake': {
            icon: 'restaurant_menu',
            class: 'icon-nutrition',
          },
          'Go Slowly': { icon: 'speed', class: 'icon-speed' },
          'Regular Monitoring': {
            icon: 'monitoring',
            class: 'icon-monitoring',
          },
          Consultation: { icon: 'person', class: 'icon-consultation' },
        };

        // Map the existing tips with icons and colors
        data.tips = data.tips.map((tip: Tip) => {
          const iconData = tipIcons[tip.title] || {
            icon: 'tips_and_updates',
            class: 'icon-default',
          };
          return {
            ...tip,
            icon: iconData.icon,
            iconClass: iconData.class,
          };
        });

        // Add community support as the 6th tip
        data.tips.push({
          title: 'Community Support',
          description: data.communitySupport,
          icon: 'group',
          iconClass: 'icon-community',
        });
      }
      this.content = data;
    });
  }
}
