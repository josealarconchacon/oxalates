import { Component, OnInit } from '@angular/core';

import { Resource } from '../model/resource';
import { ResourceService } from '../dialog-service/service/resource.service';
@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css'],
})
export class ResourcesComponent implements OnInit {
  foodResources: Resource[] = [];

  constructor(private resourceService: ResourceService) {}

  ngOnInit(): void {
    this.foodResources = this.resourceService.getFoodResources();
  }
}
