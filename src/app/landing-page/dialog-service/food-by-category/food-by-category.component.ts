import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-food-by-category',
  standalone: true,
  imports: [],
  templateUrl: './food-by-category.component.html',
  styleUrl: './food-by-category.component.css',
})
export class FoodByCategoryComponent {
  constructor(private router: Router) {}

  onCardClick(category: string): void {
    this.router.navigate(['/oxalate'], { queryParams: { category: category } });
  }
}
