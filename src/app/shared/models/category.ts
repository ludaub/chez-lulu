import { Ingredient } from '@app/shared/models/ingredient';

export interface Category {
  id: string;
  name: string;

  /**
   * Category will be considered as filterable if let undefined;
   * has to be explicitly set to `false` to be unfilterable.
   */
  filterable?: boolean;

  ingredients?: Array<Ingredient>;
}
