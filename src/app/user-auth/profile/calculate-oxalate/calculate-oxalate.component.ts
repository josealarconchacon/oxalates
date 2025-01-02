import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

interface OxalateData {
  item: string | null;
  total_oxalate_mg_per_100g: number | null;
  total_soluble_oxalate_mg_per_100g: number | null;
  serving_g: number | null;
}

interface SimilarFood {
  name: string;
  totalOxalate: number;
  solubleOxalate: number;
  similarity: number;
  servingGrams: number;
}

@Component({
  selector: 'app-calculate-oxalate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculate-oxalate.component.html',
  styleUrls: ['./calculate-oxalate.component.css'],
  animations: [
    trigger('menuAnimation', [
      state(
        'hide',
        style({
          opacity: 0,
          transform: 'scale(0.95)',
          pointerEvents: 'none',
        })
      ),
      state(
        'show',
        style({
          opacity: 1,
          transform: 'scale(1)',
          pointerEvents: 'auto',
        })
      ),
      transition('hide => show', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)'),
      ]),
      transition('show => hide', [
        animate('150ms cubic-bezier(0.4, 0, 0.2, 1)'),
      ]),
    ]),
    trigger('slideIn', [
      state(
        'false',
        style({
          opacity: 0,
          transform: 'translateX(1rem)',
        })
      ),
      state(
        'true',
        style({
          opacity: 1,
          transform: 'translateX(0)',
        })
      ),
      transition('false => true', [
        animate(
          '200ms ease',
          style({ opacity: 0, transform: 'translateX(1rem)' })
        ),
        animate('{{delay}}ms', style({ opacity: 0 })),
        animate(
          '200ms ease',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
      transition('true => false', [
        animate(
          '150ms ease',
          style({ opacity: 0, transform: 'translateX(1rem)' })
        ),
      ]),
    ]),
  ],
})
export class CalculateOxalateComponent implements OnInit {
  foodName: string = '';
  servingSize: string = '';
  servingGrams: number = 0;
  customServing: number | null = null;
  oxalatePerServing: number = 0;
  solubleOxalatePerServing: number = 0;
  foodNotFound: boolean = false;
  isCalculating: boolean = false;
  errorMessage: string = '';
  similarFoods: SimilarFood[] = [];
  showSuggestions: boolean = false;

  private foodInputSubject = new BehaviorSubject<string>('');
  private oxalateData: OxalateData[] = [];

  readonly oxalateRanges = {
    low: { min: 5, max: 15 },
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOxalateData();

    this.foodInputSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((foodName) => {
        if (foodName && foodName.trim()) {
          this.suggestSimilarFoods(foodName.trim());
        } else {
          this.clearSuggestions();
        }
      });
  }
  private loadOxalateData(): void {
    this.http
      .get<OxalateData[]>('assets/mock-oxalate/oxolateListData.json')
      .subscribe({
        next: (data) => {
          this.oxalateData = data.filter(
            (item) => item.item !== null && item.item !== undefined
          );
        },
        error: (error) => {
          console.error('Error loading oxalate data:', error);
          this.errorMessage = 'Failed to load food database';
        },
      });
  }

  onFoodNameChange(foodName: string): void {
    this.foodInputSubject.next(foodName);
  }

  calculateOxalate(): void {
    this.isCalculating = true;
    console.log('Calculating for Food:', this.foodName);

    const foodData = this.findFoodData();
    if (!foodData) {
      console.error('Food not found');
      this.isCalculating = false;
      return;
    }

    const totalOxalate = this.getValidOxalateValue(
      foodData.total_oxalate_mg_per_100g
    );
    const solubleOxalate = this.getValidOxalateValue(
      foodData.total_soluble_oxalate_mg_per_100g
    );

    const calculatedServingGrams = this.customServing || this.servingGrams;

    this.oxalatePerServing = (totalOxalate * calculatedServingGrams) / 100;
    this.solubleOxalatePerServing =
      (solubleOxalate * calculatedServingGrams) / 100;

    this.isCalculating = false;
  }

  private findFoodData(): OxalateData | null {
    const searchName = this.foodName.trim().toLowerCase();
    return (
      this.oxalateData.find(
        (item) => item.item && item.item.toLowerCase() === searchName
      ) || null
    );
  }

  private getValidOxalateValue(value: number | null): number {
    return value && value > 0 ? value : this.estimateBaselineOxalateContent();
  }

  private findSimilarFoods(
    foodName: string
  ): Array<{ data: OxalateData; similarity: number }> {
    const words = foodName
      .toLowerCase()
      .trim()
      .split(' ')
      .filter((word) => word.length > 0);

    return this.oxalateData
      .filter((food) => food.item !== null && food.item !== undefined)
      .map((food) => ({
        data: food,
        similarity: this.calculateSimilarity(food.item || '', words),
      }))
      .filter((item) => item.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  private calculateSimilarity(foodItem: string, searchWords: string[]): number {
    if (!foodItem || searchWords.length === 0) return 0;

    const itemWords = foodItem
      .toLowerCase()
      .split(' ')
      .filter((word) => word.length > 0);
    if (itemWords.length === 0) return 0;

    let matchCount = 0;
    for (const searchWord of searchWords) {
      for (const itemWord of itemWords) {
        if (itemWord.includes(searchWord) || searchWord.includes(itemWord)) {
          matchCount++;
        }
      }
    }

    return matchCount / Math.max(searchWords.length, itemWords.length);
  }

  private calculateWeightedAverage(values: number[]): number {
    if (!values || values.length === 0)
      return this.estimateBaselineOxalateContent();

    const validValues = values.filter((v) => !isNaN(v) && v > 0);
    if (validValues.length === 0) return this.estimateBaselineOxalateContent();

    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return sum / validValues.length;
  }

  private estimateBaselineOxalateContent(): number {
    return this.oxalateRanges.low.max;
  }

  private handleError(error: Error): void {
    this.errorMessage = error.message;
    this.oxalatePerServing = 0;
    this.solubleOxalatePerServing = 0;
  }

  suggestSimilarFoods(input: string): void {
    if (!input || input.length < 2) {
      this.clearSuggestions();
      return;
    }

    const similarFoodsData = this.findSimilarFoods(input);

    this.similarFoods = similarFoodsData.map((item) => ({
      name: item.data.item || '',
      totalOxalate: this.getValidOxalateValue(
        item.data.total_oxalate_mg_per_100g
      ),
      solubleOxalate: this.getValidOxalateValue(
        item.data.total_soluble_oxalate_mg_per_100g
      ),
      similarity: item.similarity,
      servingGrams: item.data.serving_g !== null ? item.data.serving_g : 0,
    }));

    this.showSuggestions = this.similarFoods.length > 0;
  }

  selectSuggestedFood(food: SimilarFood): void {
    console.log('Selected Food:', food);
    this.foodName = food.name;
    this.servingSize = `${food.totalOxalate} mg/100g`;

    this.servingGrams = food.servingGrams !== undefined ? food.servingGrams : 0;
    this.customServing = this.servingGrams;
    this.showSuggestions = false;
    this.clearSuggestions();
  }

  clearSuggestions(): void {
    this.similarFoods = [];
    this.showSuggestions = false;
  }

  getConfidenceLevel(similarity: number): string {
    if (similarity > 0.8) return 'Very High';
    if (similarity > 0.6) return 'High';
    if (similarity > 0.4) return 'Medium';
    return 'Low';
  }

  clearResults(): void {
    this.foodName = '';
    this.servingSize = '';
    this.servingGrams = 0;
    this.customServing = null;
    this.oxalatePerServing = 0;
    this.solubleOxalatePerServing = 0;
    this.showSuggestions = false;
  }

  showShareOptions = false;
  showToast = false;
  toastMessage = '';
  copySuccess = false;

  shareOptions = [
    {
      label: 'Share on X',
      icon: 'twitter',
      color: '#1DA1F2',
      getShareUrl: (text: string) =>
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    },
    {
      label: 'Share on Meta',
      icon: 'facebook',
      color: '#1877F2',
      getShareUrl: (text: string) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          window.location.href
        )}&quote=${encodeURIComponent(text)}`,
    },
    {
      label: 'Share on Reddit',
      icon: 'reddit',
      color: '#0A66C2',
      getShareUrl: (text: string) =>
        `https://www.reddit.com/submit?url=${encodeURIComponent(
          window.location.href
        )}&summary=${encodeURIComponent(text)}`,
    },
  ];

  getShareableText(): string {
    return `📊 Oxalate Results for ${this.foodName}:\n Total Oxalate: ${this.oxalatePerServing}mg \n Soluble Oxalate Per Serving ${this.solubleOxalatePerServing}${window.location.origin}`;
  }

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.getShareableText());
      this.copySuccess = true;
      this.showToastMessage('Results copied to clipboard!');
      setTimeout(() => (this.copySuccess = false), 2000);
    } catch (err) {
      this.showToastMessage('Failed to copy results');
    }
  }

  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  closeShareMenu(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.showShareOptions = false;
    }
  }
  toggleShareOptions(): void {
    this.showShareOptions = !this.showShareOptions;
  }

  private get shareableLink(): string {
    const baseUrl = 'https://yourdomain.com/oxalate-results';
    return `${baseUrl}?food=${encodeURIComponent(this.foodName)}&oxalate=${
      (this.oxalatePerServing, this.solubleOxalatePerServing)
    }`;
  }

  private getFacebookShareUrl(): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      this.shareableLink
    )}`;
  }

  private getTwitterShareUrl(): string {
    return `https://twitter.com/intent/tweet?text=Check%20out%20my%20oxalate%20results:%20${encodeURIComponent(
      this.shareableLink
    )}`;
  }

  private getRedditShareUrl(): string {
    return `https://www.reddit.com/submit?url=${encodeURIComponent(
      this.shareableLink
    )}&title=Check%20out%20my%20oxalate%20results`;
  }

  sendTextMessage(): void {
    const message = `Check out my oxalate results: ${this.shareableLink}`;
    // Implement your text message sharing logic here
    console.log('Sharing via text message:', message);
  }
}
