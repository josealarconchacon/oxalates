// Fake recipes for tests and dev checks only. Never saved anywhere.
import { Oxalate } from 'src/app/landing-page/model/oxalate';
import { Recipe } from '../../model/recipe';
import { custom, food, grams, lookup } from './fixtures';

const WORDS = ['Lemon', 'Herb', 'Chicken', 'Rice', 'Carrot', 'Soup', 'Salad', 'Crème', 'Brûlée', 'Stew', 'Bowl', 'Bread'];
const TAGS = ['Low histamine', 'Gluten-free', 'Dairy-free', 'Low FODMAP', 'Drink/Smoothie', 'Holiday', 'Mine'];

/** Foods the fake recipes use: low (1 mg/100 g) up to high (60 mg/100 g). */
export const FAKE_FOODS = lookup(
  ...[1, 5, 10, 25, 60].map((mg, i): Oxalate => food({ id: `f${i}`, item: `Food ${i}`, total_oxalate_mg_per_100g: String(mg) }))
);

/**
 * `count` recipes with varied names, tags, sizes and dates. Every 10th has an
 * ingredient with no value ("at least"); every 25th has nothing known.
 */
export function fakeRecipes(count: number): Recipe[] {
  return Array.from({ length: count }, (_, n) => {
    const name = `${WORDS[n % WORDS.length]} ${WORDS[(n * 7 + 3) % WORDS.length]} ${n + 1}`;
    const ingredients =
      n % 25 === 24
        ? [custom('Mystery spice', 10)]
        : [grams(`f${n % 5}`, 50 + ((n * 37) % 300), `Food ${n % 5}`), ...(n % 10 === 9 ? [custom('Tapioca', 20)] : [])];
    const day = String(1 + (n % 28)).padStart(2, '0');
    return {
      id: `fake-${n}`,
      ownerId: 'u1',
      name,
      serves: 1 + (n % 6),
      ingredients,
      notes: '',
      tags: TAGS.filter((_, t) => (n + t) % 3 === 0),
      createdAt: `2026-10-${day}T10:00:00.000Z`,
      updatedAt: `2026-11-${day}T${String(n % 24).padStart(2, '0')}:00:00.000Z`,
    };
  });
}
