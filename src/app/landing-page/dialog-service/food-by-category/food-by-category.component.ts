// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { CategoryService } from '../oxalate/service/category.service';
// import { FilterService } from '../oxalate/service/filter.service';
// import { CommonModule } from '@angular/common';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-food-by-category',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './food-by-category.component.html',
//   styleUrl: './food-by-category.component.css',
// })
// export class FoodByCategoryComponent implements OnInit {
//   cards: any[] = [];

//   constructor(
//     private router: Router,
//     private http: HttpClient,
//     private categoryService: CategoryService,
//     private filterService: FilterService,
//     private sanitizer: DomSanitizer
//   ) {}

//   ngOnInit(): void {
//     this.loadCards();
//   }

//   loadCards(): void {
//     this.http
//       .get<any[]>('../../../../assets/mock-oxalate/food-by-catejory.json')
//       .subscribe(
//         (data) => {
//           this.cards = data;
//           console.log('Cards loaded:', this.cards);
//         },
//         (error) => {
//           console.error('Error loading data:', error);
//         }
//       );
//   }

//   onCardClick(category: string): void {
//     console.log('Card clicked with category:', category);
//     this.categoryService.changeCategory(category);
//     this.filterService.updateFilter({
//       category: category,
//       calc_level: '',
//     });
//     this.router.navigate(['/oxalate']);
//   }

//   getSanitizedIcon(iconSvg: string): SafeHtml {
//     return this.sanitizer.bypassSecurityTrustHtml(iconSvg);
//   }
// }
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../oxalate/service/category.service';
import { FilterService } from '../oxalate/service/filter.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { SvgService } from './service/svg.service';

interface CategoryCard {
  title: string;
  iconSvg: string;
  badge?: string;
  overlayText: string;
}

@Component({
  selector: 'app-food-by-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './food-by-category.component.html',
  styleUrl: './food-by-category.component.css',
})
export class FoodByCategoryComponent implements OnInit {
  cards: CategoryCard[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private categoryService: CategoryService,
    private filterService: FilterService,
    private svgService: SvgService
  ) {}

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.http
      .get<CategoryCard[]>(
        '../../../../assets/mock-oxalate/food-by-catejory.json'
      )
      .subscribe({
        next: (data) => {
          this.cards = data;
          console.log('Cards loaded successfully:', this.cards);
          // Validate SVGs
          this.validateSvgs();
        },
        error: (error) => {
          console.error('Error loading category data:', error);
        },
      });
  }

  private validateSvgs(): void {
    this.cards.forEach((card) => {
      if (!card.iconSvg) {
        console.warn(`Missing SVG for category: ${card.title}`);
      } else if (!card.iconSvg.includes('svg')) {
        console.warn(`Invalid SVG format for category: ${card.title}`);
      }
    });
  }

  onCardClick(category: string): void {
    console.log('Category selected:', category);
    this.categoryService.changeCategory(category);
    this.filterService.updateFilter({
      category: category,
      calc_level: '',
    });
    this.router.navigate(['/oxalate']);
  }

  getSanitizedIcon(iconSvg: string): SafeHtml {
    const processed = this.svgService.sanitizeAndPrepareSvg(iconSvg);
    console.log('Processed SVG for debugging:', processed);
    return processed;
  }
}
