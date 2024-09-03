import { Component, OnInit } from '@angular/core';
import { ResourceService } from '../service/resource.service';
{
}
import { Resource } from '../model/resource';
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
