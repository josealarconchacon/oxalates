import { Component, OnInit, Input } from '@angular/core';
import { AlertService } from './alert-service/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent implements OnInit {
  @Input() message: string = '';
  isVisible: boolean = false;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertService.getAlertObservable().subscribe((newMessage) => {
      this.message = newMessage;
      this.isVisible = !!newMessage;
    });
  }

  closeAlert() {
    this.isVisible = false;
    this.alertService.closeAlert();
  }
}
