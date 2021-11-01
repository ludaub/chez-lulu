import { Injectable } from '@angular/core';

import { AppService } from '@app/app.service';
import { Cocktail } from '@app/cocktails/shared/cocktail';

@Injectable({
  providedIn: 'root',
})
export class CocktailService {
  constructor(private _app: AppService) {
    this._app.availability$.subscribe((availability) => this._filterCocktails());
    this._app.filters$.subscribe((filters) => this._filterCocktails());
  }

  private _filterCocktails(): void {
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
