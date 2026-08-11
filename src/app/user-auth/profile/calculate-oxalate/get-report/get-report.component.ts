import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subscription } from 'rxjs';
import { FoodEntryService } from '../../food-entry/service/food-entry.service';
import { AlertService } from 'src/app/shared/alert-service/alert.service';
import { AlertComponent } from 'src/app/landing-page/dialog-service/oxalate/shared/alert/alert.component';

interface FoodItem {
  foodName: string;
  servingSize: string;
  numberOfServings: number;
  oxalatePerServing: number;
  solubleOxalatePerServing: number;
}

interface DailyEntry {
  breakfast?: FoodItem[];
  lunch?: FoodItem[];
  dinner?: FoodItem[];
  snacks?: FoodItem[];
}

type TableRow = [string, string, string, string | number, string, string];

@Component({
  selector: 'app-get-report',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent],
  templateUrl: './get-report.component.html',
  styleUrl: './get-report.component.css',
})
export class GetReportComponent implements OnInit, OnDestroy {
  @Input() mealItems: any[] = [];
  @Input() totalOxalate: number = 0;
  @Input() totalSolubleOxalate: number = 0;
  @Input() selectedDate: Date = new Date();
  @Output() close = new EventEmitter<void>();
  maxDate: string;
  showAlert: boolean = false;
  alertMessage: string = '';
  private alertSubscription!: Subscription;

  constructor(
    private foodEntryService: FoodEntryService,
    private alertService: AlertService
  ) {
    this.maxDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.alertSubscription = this.alertService
      .getAlertObservable()
      .subscribe((alert) => {
        this.alertMessage = alert.message;
        this.showAlert = alert.show;
      });
  }

  ngOnDestroy(): void {
    if (this.alertSubscription) {
      this.alertSubscription.unsubscribe();
    }
  }

  // Download as CSV
  downloadCSV(): void {
    // Create a new date object and set it to midnight to avoid timezone issues
    const date = new Date(this.selectedDate);
    date.setHours(0, 0, 0, 0);

    this.foodEntryService.getDailyEntry(date).subscribe({
      next: (entry) => {
        if (!entry || this.isEmpty(entry)) {
          this.alertService.showAlert('No data available for selected date!');
          return;
        }

        const csvRows = [];
        // Header
        csvRows.push([
          'Meal Type',
          'Food Name',
          'Serving Size',
          'Servings',
          'Oxalate (mg)',
          'Soluble Oxalate (mg)',
        ]);

        // Add breakfast items
        this.addMealItemsToCSV(csvRows, entry.breakfast || [], 'Breakfast');
        // Add lunch items
        this.addMealItemsToCSV(csvRows, entry.lunch || [], 'Lunch');
        // Add dinner items
        this.addMealItemsToCSV(csvRows, entry.dinner || [], 'Dinner');
        // Add snack items
        this.addMealItemsToCSV(csvRows, entry.snacks || [], 'Snacks');

        // Add total row
        const totalOxalate = this.calculateTotalOxalate(entry);
        const totalSolubleOxalate = this.calculateTotalSolubleOxalate(entry);
        csvRows.push([
          '',
          '',
          '',
          'Total:',
          totalOxalate.toFixed(2),
          totalSolubleOxalate.toFixed(2),
        ]);

        const csvContent = csvRows
          .map((row) => row.map((field) => this.escapeCsvField(field)).join(','))
          .join('\n');
        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Oxalate_Report_${date.toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.alertService.showAlert(
          'Error downloading report. Please try again.'
        );
      },
    });
  }

  // Download as PDF
  downloadPDF(): void {
    // Create a new date object and set it to midnight to avoid timezone issues
    const date = new Date(this.selectedDate);
    date.setHours(0, 0, 0, 0);

    this.foodEntryService.getDailyEntry(date).subscribe({
      next: (entry) => {
        if (!entry || this.isEmpty(entry)) {
          this.alertService.showAlert('No data available for selected date!');
          return;
        }

        const doc = new jsPDF();
        autoTable(doc, {
          startY: 30,
          head: [
            [
              'Meal Type',
              'Food Name',
              'Serving Size',
              'Servings',
              'Oxalate (mg)',
              'Soluble Oxalate (mg)',
            ],
          ],
          body: this.preparePDFData(entry),
          theme: 'striped',
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          footStyles: { fillColor: [189, 195, 199] },
          didDrawPage: (data) => {
            doc.setFontSize(16);
            doc.text(
              `Oxalate Report - ${date.toISOString().split('T')[0]}`,
              14,
              20
            );
          },
        });

        doc.save(`Oxalate_Report_${date.toISOString().split('T')[0]}.pdf`);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.alertService.showAlert(
          'Error downloading report. Please try again.'
        );
      },
    });
  }

  // Per RFC 4180: quote any field containing a comma, quote, or newline,
  // and double up any quotes inside it. Food names in the real dataset
  // routinely contain commas (e.g. "Grains, Oats, Quick, dry"), which
  // would otherwise shift columns in the exported file.
  private escapeCsvField(value: string | number): string {
    const stringValue = String(value);
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  private isEmpty(entry: any): boolean {
    return (
      (!entry.breakfast || entry.breakfast.length === 0) &&
      (!entry.lunch || entry.lunch.length === 0) &&
      (!entry.dinner || entry.dinner.length === 0) &&
      (!entry.snacks || entry.snacks.length === 0)
    );
  }

  private addMealItemsToCSV(
    csvRows: string[][],
    items: any[],
    mealType: string
  ): void {
    items.forEach((item) => {
      csvRows.push([
        mealType,
        item.foodName,
        item.servingSize,
        item.numberOfServings.toString(),
        (item.oxalatePerServing * item.numberOfServings).toFixed(2),
        (item.solubleOxalatePerServing * item.numberOfServings).toFixed(2),
      ]);
    });
  }

  private preparePDFData(entry: DailyEntry): (string | number)[][] {
    const tableData: (string | number)[][] = [];

    // Add meal items
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach((mealType) => {
      const items = entry[mealType as keyof DailyEntry] || [];
      items.forEach((item: FoodItem) => {
        tableData.push([
          this.capitalizeFirstLetter(mealType),
          item.foodName,
          item.servingSize,
          item.numberOfServings,
          (item.oxalatePerServing * item.numberOfServings).toFixed(2),
          (item.solubleOxalatePerServing * item.numberOfServings).toFixed(2),
        ]);
      });
    });

    // Add total row
    const totalOxalate = this.calculateTotalOxalate(entry);
    const totalSolubleOxalate = this.calculateTotalSolubleOxalate(entry);
    tableData.push([
      '',
      '',
      '',
      'Total:',
      totalOxalate.toFixed(2),
      totalSolubleOxalate.toFixed(2),
    ]);

    return tableData;
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  private calculateTotalOxalate(entry: DailyEntry): number {
    let total = 0;
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach((mealType) => {
      const items = entry[mealType as keyof DailyEntry];
      if (items) {
        total += items.reduce(
          (sum: number, item: FoodItem) =>
            sum + item.oxalatePerServing * item.numberOfServings,
          0
        );
      }
    });
    return total;
  }

  private calculateTotalSolubleOxalate(entry: DailyEntry): number {
    let total = 0;
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach((mealType) => {
      const items = entry[mealType as keyof DailyEntry];
      if (items) {
        total += items.reduce(
          (sum: number, item: FoodItem) =>
            sum + item.solubleOxalatePerServing * item.numberOfServings,
          0
        );
      }
    });
    return total;
  }
}
