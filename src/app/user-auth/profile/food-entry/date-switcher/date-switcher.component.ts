import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from 'src/app/shared/services/theme.service';

@Component({
  selector: 'app-date-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-switcher.component.html',
  styleUrls: ['./date-switcher.component.css'],
})
export class DateSwitcherComponent {
  @Input() selectedDate: Date = new Date();
  @Output() dateChange = new EventEmitter<Date>();
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

  onDateChange(dateString: string) {
    const newDate = new Date(dateString);
    this.dateChange.emit(newDate);
  }

  openDatePicker() {
    // The click handler is just for semantic purposes
    // The actual date picker is handled by the input
  }
}
