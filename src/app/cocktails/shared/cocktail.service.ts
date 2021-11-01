import { Injectable } from '@angular/core';

import { AppService } from '@app/app.service';
import { Cocktail } from '@app/cocktails/shared/cocktail';
import { Ingredient } from '@app/shared/models/ingredient';
import { Availability } from '@app/shared/typings/availability';

@Injectable({
  providedIn: 'root',
})
export class CocktailService {
  constructor(private _app: AppService) {
    this._app.availability$.subscribe((availability) => this._filter());
    this._app.filters$.subscribe((filters) => this._filter());
  }

  getByAvailability(availability: Availability): Array<Cocktail> {
    let cocktails = [] as Array<Cocktail>;

    switch (availability) {
      case 'all':
        cocktails = this._app.cocktails;
        break;
      case 'available':
        cocktails = this._app.cocktails.filter((cocktail) => cocktail.isAvailable());
        break;
      case 'unavailable':
        cocktails = this._app.cocktails.filter((cocktail) => !cocktail.isAvailable());
        break;
      default:
        return cocktails;
    }

    if (this._app.filters.length) {
      cocktails = cocktails.filter((cocktail) => {
        const ingredientIds = cocktail.ingredientIds.map((ingredientId) => ingredientId.id);
        return this._app.filters.every((filter) => ingredientIds.includes(filter));
      });
    }

    return cocktails;
  }

  getByIngredient(ingredient: Ingredient): Array<Cocktail> {
    return this._app.displayedCocktails.filter((cocktail) =>
      cocktail.ingredientIds.map((ingredientId) => ingredientId.id).some((id) => id === ingredient.id)
    );
  }

  private _filter(): void {
    switch (this._app.availability) {
      case 'all':
        this._app.displayedCocktails = [...this._app.cocktails];
        break;
      case 'available':
        this._app.displayedCocktails = this._app.cocktails.filter((cocktail) => cocktail.isAvailable());
        break;
      case 'unavailable':
        this._app.displayedCocktails = this._app.cocktails.filter((cocktail) => !cocktail.isAvailable());
        break;
      default:
        this._app.displayedCocktails = [];
    }

    if (this._app.filters.length) {
      this._app.displayedCocktails = this._app.displayedCocktails.filter((cocktail) => {
        const ingredientIds = cocktail.ingredientIds.map((ingredientId) => ingredientId.id);
        return this._app.filters.every((filter) => ingredientIds.includes(filter));
      });
    }
  }
}
