import { Component, HostBinding, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';

import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { AppService } from './app.service';
import { ThemeService } from './core/theme.service';
import { Cocktail } from './shared/models/cocktail';
import { Garnish } from './shared/models/garnish';
import { Ingredient } from './shared/models/ingredient';
import { Availability } from './shared/typings/availability';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('cocktailDetailDialog') cocktailDetailDialog!: TemplateRef<{ cocktail: Cocktail }>;
  @ViewChild('filtersDialog') filtersDialog!: TemplateRef<any>;
  @HostBinding('class') private _class!: string;
  private readonly _wordSeparatorsRegexp = /[ -]/;
  private readonly _destroyed$: Subject<null> = new Subject<null>();

  constructor(public app: AppService, public theme: ThemeService, private _dialog: MatDialog) {}

  ngOnInit(): void {
    this.theme.theme$.pipe(distinctUntilChanged(), takeUntil(this._destroyed$)).subscribe((theme) => {
      this._class = theme;
    });
  }

  getCocktailsByAvailability(availability: Availability): Array<Cocktail> {
    let cocktails = [] as Array<Cocktail>;

    switch (availability) {
      case 'all':
        cocktails = this.app.cocktails;
        break;
      case 'available':
        cocktails = this.app.cocktails.filter((cocktail) => this.isCocktailAvailable(cocktail));
        break;
      case 'unavailable':
        cocktails = this.app.cocktails.filter((cocktail) => !this.isCocktailAvailable(cocktail));
        break;
      default:
        return cocktails;
    }

    if (this.app.filters.length) {
      cocktails = cocktails.filter((cocktail) => {
        const ingredientIds = cocktail.ingredientIds.map((ingredientId) => ingredientId.id);
        return this.app.filters.every((filter) => ingredientIds.includes(filter));
      });
    }

    return cocktails;
  }

  getCocktailsByIngredient(ingredient: Ingredient): Array<Cocktail> {
    return this.app.displayedCocktails.filter((cocktail) =>
      cocktail.ingredientIds.map((ingredientId) => ingredientId.id).some((id) => id === ingredient.id)
    );
  }

  identifyCocktail(index: number, cocktail: Cocktail): Cocktail['id'] {
    return cocktail.id;
  }

  getWords(value: string): Array<string> {
    return value.split(this._wordSeparatorsRegexp);
  }

  getWordSeparator(value: string, index: number): string {
    const indexes = [] as Array<number>;

    // Get indexes of word separators characters from string value.
    for (const [i, letter] of [...value].entries()) {
      if (letter.match(this._wordSeparatorsRegexp)) {
        indexes.push(i);
      }
    }

    return value.charAt(indexes[index]) === ' ' ? '&nbsp;' : value.charAt(indexes[index]);
  }

  getGlassIconByCocktail(cocktail: Cocktail): string {
    return this.app.glasses.find((glass) => glass.id === cocktail.glassId)?.icon ?? '';
  }

  getFilterableIngredients(): Array<Ingredient> {
    return this.app.ingredients
      .filter((ingredient) => this.getCocktailsByIngredient(ingredient).length > 0)
      .filter((ingredient) => ingredient.filterable || ingredient.filterable === undefined);
  }

  isCocktailAvailable(cocktail: Cocktail): boolean {
    return cocktail.ingredients.every((ingredient) => ingredient.available);
  }

  isIngredientFiltered(ingredient: Ingredient): boolean {
    return this.app.filters.includes(ingredient.id);
  }

  getCocktailIngredientQuantity(cocktail: Cocktail, ingredient: Ingredient): number | string {
    return cocktail.ingredientIds.find((ingredientId) => ingredientId.id === ingredient.id)?.quantity ?? '';
  }

  getCocktailIngredientUnit(cocktail: Cocktail, ingredient: Ingredient): string {
    return cocktail.ingredientIds.find((ingredientId) => ingredientId.id === ingredient.id)?.unit ?? '';
  }

  getGarnishNameById(garnishId: Garnish['id']): Garnish['name'] {
    return this.app.garnishes.find((garnish) => garnish.id === garnishId)?.name ?? '';
  }

  toggleFilter(event: MatButtonToggleChange): void {
    event.source.buttonToggleGroup.value = null;
  }

  openCocktailDetailDialog(cocktail: Cocktail): void {
    this._dialog.open(this.cocktailDetailDialog, { data: cocktail, panelClass: 'cocktail-detail' });
  }

  openfiltersDialog(): void {
    this._dialog.open(this.filtersDialog, { panelClass: 'filters-dialog' });
  }

  resetFilters(): void {
    this.app.filters = [];
  }

  isNumber(value: string): boolean {
    return !isNaN(Number(value));
  }

  ngOnDestroy(): void {
    this._destroyed$.next(null);
    this._destroyed$.complete();
  }
}
