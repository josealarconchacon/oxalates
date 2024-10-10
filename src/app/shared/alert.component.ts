import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent implements OnInit {
  @Input() message: string = ''; // Message to display
  @Input() isVisible: boolean = false; // Controls visibility
  @Input() alertType: string = 'error'; // Type of alert (error, success, etc.)

  constructor() {}

  ngOnInit(): void {}

  // Dismiss the alert automatically after 5 seconds
  ngOnChanges(): void {
    if (this.isVisible) {
      setTimeout(() => {
        this.isVisible = false;
      }, 5000); // 5 seconds duration
    }
  }
}
