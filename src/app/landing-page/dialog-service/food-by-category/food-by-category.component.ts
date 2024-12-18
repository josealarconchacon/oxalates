import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../oxalate/service/category.service';
import { FilterService } from '../oxalate/service/filter.service';

@Component({
  selector: 'app-food-by-category',
  standalone: true,
  imports: [],
  templateUrl: './food-by-category.component.html',
  styleUrl: './food-by-category.component.css',
})
export class FoodByCategoryComponent {
  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private filterService: FilterService
  ) {}

  onCardClick(category: string): void {
    this.categoryService.changeCategory(category);
    this.filterService.updateFilter({
      category: category,
      calc_level: '',
    });
    this.router.navigate(['/oxalate'], { queryParams: { category: category } });
  }
}
