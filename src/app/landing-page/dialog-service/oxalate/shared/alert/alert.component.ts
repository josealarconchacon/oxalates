import { Component, Input } from '@angular/core';
import { IconComponent } from 'src/app/shared/components/icon/icon.component';


@Component({
  selector: 'app-alert',
  imports: [IconComponent],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent {
  @Input() message: string = '';
  isVisible: boolean = true;

  closeAlert() {
    this.isVisible = false;
  }
}
