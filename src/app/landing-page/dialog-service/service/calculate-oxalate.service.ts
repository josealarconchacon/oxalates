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

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  private singularize(word: string): string {
    // Basic pluralization rules
    if (word.endsWith('ies')) {
      return word.slice(0, -3) + 'y';
    }
    if (word.endsWith('es')) {
      return word.slice(0, -2);
    }
    if (word.endsWith('s')) {
      return word.slice(0, -1);
    }
    return word;
  }

  private calculateWordSimilarity(word1: string, word2: string): number {
    word1 = word1.toLowerCase();
    word2 = word2.toLowerCase();

    // Exact match
    if (word1 === word2) return 1;

    // Handle plurals
    if (this.singularize(word1) === this.singularize(word2)) return 0.9;

    // Partial match at word start
    if (word2.startsWith(word1) || word1.startsWith(word2)) {
      const minLength = Math.min(word1.length, word2.length);
      const maxLength = Math.max(word1.length, word2.length);
      return 0.7 * (minLength / maxLength);
    }

    // Substring match
    if (word2.includes(word1) || word1.includes(word2)) {
      const minLength = Math.min(word1.length, word2.length);
      const maxLength = Math.max(word1.length, word2.length);
      return 0.5 * (minLength / maxLength);
    }

    // Levenshtein distance for fuzzy matching
    const distance = this.levenshteinDistance(word1, word2);
    const maxLength = Math.max(word1.length, word2.length);
    const similarity = 1 - distance / maxLength;

    return similarity > 0.6 ? similarity : 0;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1)
      .fill(0)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j - 1] + 1,
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1
          );
        }
      }
    }

    return dp[m][n];
  }

  private calculateSimilarity(foodName: string, searchWords: string[]): number {
    const normalizedFoodName = this.normalizeText(foodName);
    const foodWords = normalizedFoodName.split(' ');

    let totalSimilarity = 0;
    let matchedWords = 0;

    for (const searchWord of searchWords) {
      let maxWordSimilarity = 0;

      for (const foodWord of foodWords) {
        const similarity = this.calculateWordSimilarity(searchWord, foodWord);
        maxWordSimilarity = Math.max(maxWordSimilarity, similarity);
      }

      if (maxWordSimilarity > 0) {
        totalSimilarity += maxWordSimilarity;
        matchedWords++;
      }
    }

    // Weight by the proportion of matched words and their position in the text
    const matchRatio = matchedWords / searchWords.length;
    const positionBonus = this.calculatePositionBonus(
      normalizedFoodName,
      searchWords
    );

    return (totalSimilarity / searchWords.length) * matchRatio * positionBonus;
  }

  private calculatePositionBonus(
    foodName: string,
    searchWords: string[]
  ): number {
    // Give bonus for matches at the start of the food name
    const firstWord = searchWords[0].toLowerCase();
    const normalizedFoodName = foodName.toLowerCase();

    if (normalizedFoodName.startsWith(firstWord)) {
      return 1.2;
    }

    return 1;
  }

  findSimilarFoods(input: string): SimilarFood[] {
    if (!input.trim()) return [];

    const words = this.normalizeText(input)
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
      .filter((item) => item.similarity > 0.2) // Lower threshold for more results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // Show more results
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
}
