import { Category } from '@app/shared/models/category';

export interface Ingredient {
  id: string;
  name: string;
  brand?: string;
  available: boolean;

  /**
   * Ingredient will be considered as filterable if let undefined;
   * has to be explicitly set to `false` to be unfilterable.
   */
  filterable?: boolean;

  categoryId: Category['id'];
  category?: Category;
}
