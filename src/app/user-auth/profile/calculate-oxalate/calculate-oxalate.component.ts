import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';

interface OxalateData {
  item: string | null;
  total_oxalate_mg_per_100g: number | null;
  total_soluble_oxalate_mg_per_100g: number | null;
  category?: string;
  food_group?: string;
}
interface SimilarFood {
  name: string;
  totalOxalate: number;
  solubleOxalate: number;
  similarity: number;
}

@Component({
  selector: 'app-calculate-oxalate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculate-oxalate.component.html',
  styleUrls: ['./calculate-oxalate.component.css'],
})
export class CalculateOxalateComponent implements OnInit {
  foodName: string = '';
  servingSize: string = '';
  servingUnit: string = 'tsp';
  servingGrams: number = 0;
  oxalatePerServing: number = 0;
  solubleOxalatePerServing: number = 0;
  foodNotFound: boolean = false;
  isCalculating: boolean = false;
  errorMessage: string = '';
  // new
  similarFoods: SimilarFood[] = [];

  showSuggestions: boolean = false;

  private foodInputSubject = new BehaviorSubject<string>('');
  private oxalateData: OxalateData[] = [];

  readonly units = {
    tsp: { grams: 4.93, name: 'teaspoon' },
    cup: { grams: 240, name: 'cup' },
    bottle: { grams: 500, name: 'bottle' },
  };

  readonly oxalateRanges = {
    veryLow: { min: 0, max: 5 },
    low: { min: 5, max: 15 },
    medium: { min: 15, max: 50 },
    high: { min: 50, max: 100 },
    veryHigh: { min: 100, max: 900 },
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOxalateData();

    this.foodInputSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((foodName) => {
        if (foodName && foodName.trim()) {
          this.suggestSimilarFoods(foodName.trim());
        }
      });
  }

  private loadOxalateData(): void {
    this.http
      .get<OxalateData[]>('assets/mock-oxalate/oxolateListData.json')
      .subscribe({
        next: (data) => {
          // Filter out items with null names during data load
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
    if (!this.foodName.trim()) {
      this.errorMessage = 'Please enter a food name';
      return;
    }

    this.isCalculating = true;
    this.errorMessage = '';
    this.foodNotFound = false;

    try {
      const totalGrams = this.calculateTotalGrams();
      if (totalGrams <= 0) {
        throw new Error('Invalid serving size');
      }

      const foodData = this.findFoodData();
      if (!foodData) {
        this.handleFoodNotFound(totalGrams);
        return;
      }

      this.calculateOxalateValues(foodData, totalGrams);
    } catch (error: any) {
      this.handleError(error);
    } finally {
      this.isCalculating = false;
    }
  }

  private calculateTotalGrams(): number {
    if (this.servingGrams > 0) {
      return this.servingGrams;
    }

    const servingSizeDecimal = this.parseServingSize(this.servingSize);
    if (servingSizeDecimal <= 0) {
      throw new Error('Invalid serving size format');
    }

    const unit = this.units[this.servingUnit as keyof typeof this.units];
    if (!unit) {
      throw new Error('Invalid serving unit');
    }

    return servingSizeDecimal * unit.grams;
  }

  private parseServingSize(servingSize: string): number {
    if (!servingSize || !servingSize.trim()) {
      return 0;
    }

    servingSize = servingSize.trim();

    if (servingSize.includes('.')) {
      const decimal = parseFloat(servingSize);
      return !isNaN(decimal) ? decimal : 0;
    }

    if (servingSize.includes('/')) {
      const [numerator, denominator] = servingSize
        .split('/')
        .map((s) => parseFloat(s.trim()));
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }

    const whole = parseInt(servingSize);
    return !isNaN(whole) ? whole : 0;
  }

  private findFoodData(): OxalateData | null {
    const searchName = this.foodName.trim().toLowerCase();
    return (
      this.oxalateData.find(
        (item) => item.item && item.item.toLowerCase() === searchName
      ) || null
    );
  }

  private calculateOxalateValues(
    foodData: OxalateData,
    totalGrams: number
  ): void {
    const totalOxalate = this.getValidOxalateValue(
      foodData.total_oxalate_mg_per_100g
    );
    const solubleOxalate = this.getValidOxalateValue(
      foodData.total_soluble_oxalate_mg_per_100g
    );

    this.oxalatePerServing = (totalOxalate * totalGrams) / 100;
    this.solubleOxalatePerServing = (solubleOxalate * totalGrams) / 100;
  }

  private handleFoodNotFound(totalGrams: number): void {
    this.foodNotFound = true;
    const estimatedValues = this.estimateOxalateContent(
      this.foodName,
      totalGrams
    );
    this.oxalatePerServing = estimatedValues.total;
    this.solubleOxalatePerServing = estimatedValues.soluble;
  }

  private getValidOxalateValue(value: number | null): number {
    if (value === null || value === undefined || isNaN(value) || value <= 0) {
      return this.estimateBaselineOxalateContent();
    }
    return value;
  }

  private estimateOxalateContent(
    foodName: string,
    totalGrams: number
  ): { total: number; soluble: number } {
    const similarFoods = this.findSimilarFoods(foodName);

    if (similarFoods.length > 0) {
      const totalOxalate = this.calculateWeightedAverage(
        similarFoods.map((f) =>
          this.getValidOxalateValue(f.data.total_oxalate_mg_per_100g)
        )
      );
      const solubleOxalate = this.calculateWeightedAverage(
        similarFoods.map((f) =>
          this.getValidOxalateValue(f.data.total_soluble_oxalate_mg_per_100g)
        )
      );

      return {
        total: (totalOxalate * totalGrams) / 100,
        soluble: (solubleOxalate * totalGrams) / 100,
      };
    }

    const baselineOxalate = this.estimateBaselineOxalateContent();
    return {
      total: (baselineOxalate * totalGrams) / 100,
      soluble: (baselineOxalate * 0.4 * totalGrams) / 100,
    };
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
      this.similarFoods = [];
      this.showSuggestions = false;
      return;
    }

    const similarFoodsData = this.findSimilarFoods(input);

    this.similarFoods = similarFoodsData.map((item) => {
      const totalOxalate = this.getValidOxalateValue(
        item.data.total_oxalate_mg_per_100g
      );
      const solubleOxalate = this.getValidOxalateValue(
        item.data.total_soluble_oxalate_mg_per_100g
      );

      return {
        name: item.data.item || '',
        totalOxalate: totalOxalate,
        solubleOxalate: solubleOxalate,
        similarity: item.similarity,
      };
    });

    this.showSuggestions = this.similarFoods.length > 0;
  }

  selectSuggestedFood(food: SimilarFood): void {
    this.foodName = food.name;
    this.showSuggestions = false;
    this.calculateOxalate();
  }

  // Optional: Close suggestions when clicking outside
  onClickOutside(): void {
    this.showSuggestions = false;
  }

  // Helper method to get confidence level based on similarity
  getConfidenceLevel(similarity: number): string {
    if (similarity > 0.8) return 'Very High';
    if (similarity > 0.6) return 'High';
    if (similarity > 0.4) return 'Medium';
    return 'Low';
  }
}
