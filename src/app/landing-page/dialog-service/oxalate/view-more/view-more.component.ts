import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { OxalateService } from '../../service/oxalate.service';

@Component({
  selector: 'app-view-more',
  templateUrl: './view-more.component.html',
  styleUrls: ['./view-more.component.css'],
})
export class ViewMoreComponent implements OnInit {
  oxalateData: Oxalate | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private oxalateService: OxalateService
  ) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      // Receive the passed oxalate data from the state
      this.oxalateData = navigation.extras.state['selectedOxalate'];
    } else {
      // If no state data, fallback to fetching by ID
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.oxalateService.getOxalateById(id).subscribe((data) => {
            this.oxalateData = data;
          });
        }
      });
    }
  }
}
