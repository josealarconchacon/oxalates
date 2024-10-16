import { Component, OnInit } from '@angular/core';
import { AlertService } from './alert-service/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent implements OnInit {
  message: string = '';
  isVisible: boolean = false;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertService.getAlertObservable().subscribe((message) => {
      this.message = message;
      this.isVisible = message ? true : false;
    });
  }

  closeAlert() {
    this.isVisible = false;
    this.alertService.closeAlert();
  }
}
