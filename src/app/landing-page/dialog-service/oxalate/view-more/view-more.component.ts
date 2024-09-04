import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { OxalateService } from '../../service/oxalate.service';

@Component({
  selector: 'app-view-more',
  templateUrl: './view-more.component.html',
  styleUrls: ['./view-more.component.css'],
})
export class ViewMoreComponent implements OnInit {
  @Input() oxalateData: Oxalate | undefined;

  constructor(
    private route: ActivatedRoute,
    private oxalateService: OxalateService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.oxalateService.getOxalateById(id).subscribe((data) => {
        this.oxalateData = data;
      });
    }
  }
}
