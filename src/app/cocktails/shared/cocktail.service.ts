import { Injectable } from '@angular/core';

import { AppStore } from '@app/app.store.service';
import { Cocktail } from '@app/cocktails/shared/cocktail';
import { Ingredient } from '@app/shared/models/ingredient';
import { Availability } from '@app/shared/typings/availability';

@Injectable({
  providedIn: 'root',
})
export class CocktailService {
  constructor(private _store: AppStore) {
    this._store.availability$.subscribe(() => this._filter());
    this._store.filters$.subscribe(() => this._filter());
  }

  getByAvailability(availability: Availability): Array<Cocktail> {
    let cocktails = [] as Array<Cocktail>;

    switch (availability) {
      case 'all':
        cocktails = this._store.cocktails;
        break;
      case 'available':
        cocktails = this._store.cocktails.filter((cocktail) => cocktail.isAvailable());
        break;
      case 'unavailable':
        cocktails = this._store.cocktails.filter((cocktail) => !cocktail.isAvailable());
        break;
      default:
        return cocktails;
    }

    if (this._store.filters.length) {
      cocktails = cocktails.filter((cocktail) => {
        const ingredientIds = cocktail.ingredientIds.map((ingredientId) => ingredientId.id);
        return this._store.filters.every((filter) => ingredientIds.includes(filter));
      });
    }

    return cocktails;
  }

  getByIngredient(ingredient: Ingredient): Array<Cocktail> {
    return this._store.displayedCocktails.filter((cocktail) =>
      cocktail.ingredientIds.map((ingredientId) => ingredientId.id).some((id) => id === ingredient.id)
    );
  }

  private _filter(): void {
    switch (this._store.availability) {
      case 'all':
        this._store.displayedCocktails = [...this._store.cocktails];
        break;
      case 'available':
        this._store.displayedCocktails = this._store.cocktails.filter((cocktail) => cocktail.isAvailable());
        break;
      case 'unavailable':
        this._store.displayedCocktails = this._store.cocktails.filter((cocktail) => !cocktail.isAvailable());
        break;
      default:
        this._store.displayedCocktails = [];
    }

    if (this._store.filters.length) {
      this._store.displayedCocktails = this._store.displayedCocktails.filter((cocktail) => {
        const ingredientIds = cocktail.ingredientIds.map((ingredientId) => ingredientId.id);
        return this._store.filters.every((filter) => ingredientIds.includes(filter));
      });
    }
  }
}
