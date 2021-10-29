import { Garnish } from '@app/shared/models/garnish';
import { Glass } from '@app/shared/models/glass';
import { Ingredient } from '@app/shared/models/ingredient';

type IngredientId = {
  id: Ingredient['id'];
  quantity: number | string;
  unit: string;
};

export class Cocktail {
  id: string;
  name: string;
  recipe: string;
  ingredientIds: Array<IngredientId>;
  glassId: Glass['id'];
  garnishIds?: Array<Garnish['id']>;

  /**
   * Cocktail will be displayed if let undefined;
   * has to be explicitly set to false to not be displayed.
   */
  displayed?: boolean;

  // Relationships.
  ingredients!: Array<Ingredient>;
  glass!: Glass;
  garnishes?: Array<Garnish>;

  constructor(
    id: string,
    name: string,
    recipe: string,
    ingredientIds: Array<IngredientId>,
    glassId: Glass['id'],
    garnishIds?: Array<Garnish['id']>
  ) {
    this.id = id;
    this.name = name;
    this.recipe = recipe;
    this.ingredientIds = ingredientIds;
    this.glassId = glassId;
    this.garnishIds = garnishIds;
  }

  isAvailable(): boolean {
    return this.ingredients.every((ingredient) => ingredient.available);
  }

  getIngredientQuantity(ingredient: Ingredient): number | string {
    return this.ingredientIds.find((ingredientId) => ingredientId.id === ingredient.id)?.quantity ?? '';
  }

  getIngredientUnit(ingredient: Ingredient): string {
    return this.ingredientIds.find((ingredientId) => ingredientId.id === ingredient.id)?.unit ?? '';
  }
}
