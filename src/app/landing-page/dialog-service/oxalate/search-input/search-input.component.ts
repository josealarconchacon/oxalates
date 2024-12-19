import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FilterService } from '../service/filter.service';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.css'],
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() searchQuery: string = '';
  @Output() searchQueryChange = new EventEmitter<string>();

  private subscription: Subscription = new Subscription();

  constructor(private filterService: FilterService) {}

  ngOnInit() {
    this.subscription = this.filterService.clearSearch$.subscribe(() => {
      this.searchQuery = '';
      this.searchQueryChange.emit('');
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onInputChange(value: string): void {
    this.searchQueryChange.emit(value);
  }
  clearSearch() {
    this.searchQuery = '';
  }
}
