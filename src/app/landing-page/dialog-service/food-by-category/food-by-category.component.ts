import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryCard } from '../../model/category-card';
import { CategoryService } from '../oxalate/service/category.service';
import { FilterService } from '../oxalate/service/filter.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { SvgService } from './service/svg.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-food-by-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './food-by-category.component.html',
  styleUrl: './food-by-category.component.css',
})
export class FoodByCategoryComponent implements OnInit, OnDestroy {
  cardsMap: Map<string, CategoryCard> = new Map();
  isDarkTheme$ = this.themeService.isDarkTheme$;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private categoryService: CategoryService,
    private filterService: FilterService,
    private svgService: SvgService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadCards();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  get cardsArray(): CategoryCard[] {
    return Array.from(this.cardsMap.values());
  }

  loadCards(): void {
    this.subscriptions.push(
      this.http
        .get<CategoryCard[]>(
          '../../../../assets/mock-oxalate/food-by-catejory.json'
        )
        .subscribe({
          next: (data) => {
            this.populateCardsMap(data);
            // Only validate SVGs in development mode
            if (!this.isProduction()) {
              this.validateSvgs();
            }
          },
          error: (error) => {
            console.error('Error loading category data:', error);
          },
        })
    );
  }

  private isProduction(): boolean {
    return (
      window.location.hostname !== 'localhost' &&
      !window.location.hostname.includes('127.0.0.1')
    );
  }

  populateCardsMap(data: CategoryCard[]): void {
    data.forEach((card) => {
      if (card.title) {
        this.cardsMap.set(card.title, card);
      } else {
        console.warn('Card without a title found and skipped:', card);
      }
    });
  }

  validateSvgs(): void {
    // Only validate in development to avoid performance impact in production
    if (this.isProduction()) return;

    this.cardsMap.forEach((card, title) => {
      if (!card.iconSvg) {
        console.warn(`Missing SVG for category: ${title}`);
      } else if (!this.isSvgValid(card.iconSvg)) {
        console.warn(`Invalid SVG format for category: ${title}`);
      }
    });
  }

  isSvgValid(svg: string): boolean {
    return svg.startsWith('<svg') && svg.endsWith('</svg>');
  }

  onCardClick(category: string): void {
    console.log('Category selected:', category);
    if (this.cardsMap.has(category)) {
      this.categoryService.changeCategory(category);
      this.filterService.updateFilter({
        category: category,
        calc_level: '',
      });
      this.router.navigate(['/oxalate'], {
        queryParams: {
          category: category,
        },
      });
    } else {
      console.warn(`Category "${category}" not found in cardsMap.`);
    }
  }

  getSanitizedIcon(iconSvg: string): SafeHtml {
    const processed = this.svgService.sanitizeAndPrepareSvg(iconSvg);
    return processed;
  }
}
