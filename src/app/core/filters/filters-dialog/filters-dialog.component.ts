import { Component } from '@angular/core';

import { AppService } from '@app/app.service';
import { Cocktail } from '@app/cocktails/shared/cocktail';
import { CocktailService } from '@app/cocktails/shared/cocktail.service';
import { Ingredient } from '@app/shared/models/ingredient';

@Component({
  selector: 'app-filters-dialog',
  templateUrl: './filters-dialog.component.html',
})
export class FiltersDialogComponent {
  constructor(public app: AppService, private _cocktailService: CocktailService) {}

  getFilterableIngredients(): Array<Ingredient> {
    return this.app.ingredients
      .filter((ingredient) => this._cocktailService.getByIngredient(ingredient).length > 0)
      .filter((ingredient) => ingredient.filterable || ingredient.filterable === undefined);
  }

  getCocktailsByIngredient(ingredient: Ingredient): Array<Cocktail> {
    return this._cocktailService.getByIngredient(ingredient);
  }

  resetFilters(): void {
    this.app.filters = [];
  }
}
