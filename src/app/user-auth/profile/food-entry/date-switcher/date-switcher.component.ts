import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from 'src/app/shared/services/theme.service';
import {
  MatDatepickerModule,
  MatDatepicker,
} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-date-switcher',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
  ],
  templateUrl: './date-switcher.component.html',
  styleUrls: ['./date-switcher.component.css'],
})
export class DateSwitcherComponent {
  @Input() selectedDate: Date = new Date();
  @Output() dateChange = new EventEmitter<Date>();
  @ViewChild('picker') datePicker!: MatDatepicker<Date>;

  isDarkTheme: boolean = false;

  constructor(private themeService: ThemeService) {
    this.themeService.isDarkTheme$.subscribe((isDark) => {
      this.isDarkTheme = isDark;
    });
  }

  previousDay() {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    this.dateChange.emit(newDate);
  }

  nextDay() {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    this.dateChange.emit(newDate);
  }

  onDateChange(date: Date | null) {
    if (date) {
      this.dateChange.emit(date);
    }
  }

  openDatePicker() {
    // Add dark theme class to the datepicker when it opens
    setTimeout(() => {
      const datepickerPopup = document.querySelector('.mat-datepicker-popup');
      if (datepickerPopup) {
        if (this.isDarkTheme) {
          datepickerPopup.classList.add('dark-theme');
        } else {
          datepickerPopup.classList.remove('dark-theme');
        }
      }
    });
  }
}
