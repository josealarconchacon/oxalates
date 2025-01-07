import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface SimilarFood {
  name: string;
  totalOxalate: number;
  solubleOxalate: number;
  similarity: number;
  servingGrams: number;
}

interface OxalateData {
  item: string | null;
  serving_size: number | null; // Updated
  calc_oxalate_per_serving: number | null; // Updated
  calc_soluble_mg_oxalate_per_serving: number | null; // Updated
}

@Injectable({
  providedIn: 'root',
})
export class CalculateOxalateService {
  private oxalateData: OxalateData[] = [];

  constructor(private http: HttpClient) {
    this.loadOxalateData();
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
        },
      });
  }

  calculateOxalate(
    foodName: string,
    servingGrams: number
  ): { totalOxalate: number; solubleOxalate: number } {
    const foodData = this.findFoodData(foodName);
    if (!foodData) {
      throw new Error('Food not found');
    }

    const totalOxalatePerServing = this.getValidOxalateValue(
      foodData.calc_oxalate_per_serving
    );
    const solubleOxalatePerServing = this.getValidOxalateValue(
      foodData.calc_soluble_mg_oxalate_per_serving
    );

    return {
      totalOxalate: totalOxalatePerServing,
      solubleOxalate: solubleOxalatePerServing,
    };
  }

  findSimilarFoods(input: string): SimilarFood[] {
    const words = input
      .toLowerCase()
      .trim()
      .split(' ')
      .filter((word) => word.length > 0);

    return this.oxalateData
      .filter((food) => food.item !== null && food.item !== undefined)
      .map((food) => ({
        name: food.item || '',
        totalOxalate: this.getValidOxalateValue(food.calc_oxalate_per_serving),
        solubleOxalate: this.getValidOxalateValue(
          food.calc_soluble_mg_oxalate_per_serving
        ),
        similarity: this.calculateSimilarity(food.item || '', words),
        servingGrams: food.serving_size !== null ? food.serving_size : 0,
        confidenceLevel: this.getConfidenceLevel(
          this.calculateSimilarity(food.item || '', words)
        ),
      }))
      .filter((item) => item.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  getConfidenceLevel(similarity: number): string {
    if (similarity > 0.8) return 'Very High';
    if (similarity > 0.6) return 'High';
    if (similarity > 0.4) return 'Medium';
    return 'Low';
  }

  private findFoodData(foodName: string): OxalateData | undefined {
    return this.oxalateData.find(
      (item) => item.item && item.item.toLowerCase() === foodName.toLowerCase()
    );
  }

  private getValidOxalateValue(value: number | null): number {
    return value && value > 0 ? value : this.estimateBaselineOxalateContent();
  }

  private estimateBaselineOxalateContent(): number {
    return 0;
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
}
