import { SavedMeal } from './saved-meal';

export interface DailyTotal {
  totalOxalate: number;
  totalSolubleOxalate: number;
  meals: SavedMeal[];
}
