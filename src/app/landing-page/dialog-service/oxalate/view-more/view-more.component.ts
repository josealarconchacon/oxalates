import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Oxalate } from 'src/app/landing-page/model/oxalate';

@Component({
  selector: 'app-view-more',
  templateUrl: './view-more.component.html',
  styleUrls: ['./view-more.component.css'],
})
export class ViewMoreComponent implements OnInit {
  @Input() oxalateData: Oxalate | undefined;
  savedItems: Oxalate[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (
      navigation?.extras.state &&
      navigation.extras.state['selectedOxalate']
    ) {
      this.oxalateData = navigation.extras.state['selectedOxalate'] as Oxalate;
      console.log('Received oxalate data:', this.oxalateData); // Debugging line
    } else {
      console.warn('No state data found for selected oxalate.');
    }
  }

  onSave(): void {
    if (this.oxalateData) {
      this.savedItems.push(this.oxalateData);
      console.log('Item saved:', this.oxalateData);
      alert('Item saved successfully!');
    } else {
      console.warn('No oxalate data available to save.');
    }
  }
}
