import { Component, OnInit } from '@angular/core';

import { Resource } from '../model/resource';
import { ResourceService } from '../dialog-service/service/resource.service';
/** Badge tint per food; foods without one cycle through the list. */
const BADGE_TINTS: Record<string, string> = {
  Spinach: 'tint-green',
  Chocolate: 'tint-brown',
  Almonds: 'tint-gold',
  Potatoes: 'tint-orange',
  'Rice Bran': 'tint-violet',
  Beets: 'tint-rose',
};
const TINT_CYCLE = Object.values(BADGE_TINTS);

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css'],
  standalone: false,
})
export class ResourcesComponent implements OnInit {
  foodResources: Resource[] = [];

  constructor(private resourceService: ResourceService) {}

  ngOnInit(): void {
    this.foodResources = this.resourceService.getFoodResources();
  }

  tintFor(name: string, index: number): string {
    return BADGE_TINTS[name] ?? TINT_CYCLE[index % TINT_CYCLE.length];
  }

  initial(name: string): string {
    return name.trim().charAt(0).toUpperCase();
  }
}
