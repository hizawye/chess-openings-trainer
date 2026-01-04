import type { Opening } from '../types';
import type { Category } from '../data/categories';

export interface CategorizedOpenings {
  categoryId: string;
  categoryName: string;
  description?: string;
  openings: Opening[];
}

export function categorizeOpenings(
  openings: Opening[],
  categories: Category[]
): CategorizedOpenings[] {
  return categories.map(category => ({
    categoryId: category.id,
    categoryName: category.name,
    description: category.description,
    openings: openings.filter(opening => category.matcher(opening))
  })).filter(group => group.openings.length > 0);
}
