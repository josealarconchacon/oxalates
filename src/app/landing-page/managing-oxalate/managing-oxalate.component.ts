import { Component, OnInit } from '@angular/core';
import { OxalateService } from './service/oxalate.service';

@Component({
  selector: 'app-managing-oxalate',
  templateUrl: './managing-oxalate.component.html',
  styleUrls: ['./managing-oxalate.component.css'],
})
export class ManagingOxalateComponent implements OnInit {
  content: any;

  constructor(private oxalateService: OxalateService) {}

  ngOnInit() {
    this.oxalateService.getOxalateContent().subscribe((data) => {
      this.content = data;
    });
  }
}
