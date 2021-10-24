import { Garnish } from './garnish';
import { Glass } from './glass';
import { Ingredient } from './ingredient';

export interface Cocktail {
  id: string;
  name: string;
  recipe: string;
  ingredientIds: Array<{
    id: Ingredient['id'];
    quantity: number;
    unit: string;
  }>;
  ingredients: Array<Ingredient>;
  garnishIds?: Array<Garnish['id']>;
  glassId: Glass['id'];

  /**
   * Cocktail will be displayed if let undefined;
   * has to be explicitly set to false to not be displayed.
   */
  displayed?: boolean;
}
