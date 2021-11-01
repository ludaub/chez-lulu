import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, forkJoin } from 'rxjs';

import { Cocktail } from '@app/cocktails/shared/cocktail';
import { Garnish } from '@app/shared/models/garnish';
import { Glass } from '@app/shared/models/glass';
import { Ingredient } from '@app/shared/models/ingredient';
import { Availability } from '@app/shared/typings/availability';
import { AppliedTheme, Theme } from '@app/shared/typings/theme';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  /**
   * Cocktails data.
   */
  get cocktails(): Array<Cocktail> {
    return this._cocktails.getValue();
  }
  set cocktails(cocktails: Array<Cocktail>) {
    this._cocktails.next(cocktails);
  }
  private readonly _cocktails = new BehaviorSubject<Array<Cocktail>>([]);
  readonly cocktails$ = this._cocktails as Observable<Array<Cocktail>>;

  /**
   * Displayed cocktails.
   */
  get displayedCocktails(): Array<Cocktail> {
    return this._displayedCocktails.getValue();
  }
  set displayedCocktails(cocktails: Array<Cocktail>) {
    this._displayedCocktails.next(cocktails);
  }
  private readonly _displayedCocktails = new BehaviorSubject<Array<Cocktail>>([]);
  readonly displayedCocktails$ = this._displayedCocktails as Observable<Array<Cocktail>>;

  /**
   * Garnishes data.
   */
  get garnishes(): Array<Garnish> {
    return this._garnishes.getValue();
  }
  set garnishes(garnishes: Array<Garnish>) {
    this._garnishes.next(garnishes);
  }
  private readonly _garnishes = new BehaviorSubject<Array<Garnish>>([]);
  readonly garnishes$ = this._garnishes as Observable<Array<Garnish>>;

  /**
   * Glasses data.
   */
  get glasses(): Array<Glass> {
    return this._glasses.getValue();
  }
  set glasses(glasses: Array<Glass>) {
    this._glasses.next(glasses);
  }
  private readonly _glasses = new BehaviorSubject<Array<Glass>>([]);
  readonly glasses$ = this._glasses as Observable<Array<Glass>>;

  /**
   * Ingredients data.
   */
  get ingredients(): Array<Ingredient> {
    return this._ingredients.getValue();
  }
  set ingredients(ingredients: Array<Ingredient>) {
    this._ingredients.next(ingredients);

    // Set ingredients in cocktails.
    for (const cocktail of this.cocktails) {
      cocktail.ingredients = [];

      for (const ingredientId of cocktail.ingredientIds) {
        const ingredient = this.ingredients.find((ingredient) => ingredient.id === ingredientId.id);
        if (ingredient) cocktail.ingredients.push(ingredient);
      }
    }
  }
  private readonly _ingredients = new BehaviorSubject<Array<Ingredient>>([]);
  readonly ingredients$ = this._ingredients as Observable<Array<Ingredient>>;

  /**
   * Availability. Used as value by availability toggle.
   */
  get availability(): Availability {
    return this._availability.getValue();
  }
  set availability(availability: Availability) {
    this._availability.next(availability);
    localStorage.setItem('availability', availability);
    this._filterCocktails();
  }
  private readonly _availability = new BehaviorSubject<Availability>('available');
  readonly availability$ = this._availability as Observable<Availability>;

  /**
   * Filters (ingredient IDs).
   */
  get filters(): Array<Ingredient['id']> {
    return this._filters.getValue();
  }
  set filters(filters: Array<Ingredient['id']>) {
    this._filters.next(filters);
    this._filterCocktails();
  }
  private readonly _filters = new BehaviorSubject<Array<Ingredient['id']>>([]);
  readonly filters$ = this._filters as Observable<Array<Ingredient['id']>>;

  /**
   * Application selected theme.
   */
  get selectedTheme(): Theme {
    return this._selectedTheme.getValue();
  }
  set selectedTheme(theme: Theme) {
    this._selectedTheme.next(theme);
  }
  private readonly _selectedTheme = new BehaviorSubject<Theme>('light-theme');
  readonly selectedTheme$ = this._selectedTheme as Observable<Theme>;

  /**
   * Application applied theme (excludes system theme).
   */
  get appliedTheme(): AppliedTheme {
    return this._appliedTheme.getValue();
  }
  set appliedTheme(theme: AppliedTheme) {
    this._appliedTheme.next(theme);
  }
  private readonly _appliedTheme = new BehaviorSubject<AppliedTheme>('light-theme');
  readonly appliedTheme$ = this._appliedTheme as Observable<AppliedTheme>;

  /**
   * Whether user has a system theme defined.
   */
  get hasSystemTheme() {
    return this._hasSystemTheme;
  }
  set hasSystemTheme(has: boolean) {
    this._hasSystemTheme = has;
  }
  private _hasSystemTheme = false;

  constructor(private _http: HttpClient) {
    forkJoin({
      cocktails: this._http.get<Array<Cocktail>>('data/cocktails.json'),
      garnishes: this._http.get<Array<Garnish>>('data/garnishes.json'),
      glasses: this._http.get<Array<Glass>>('data/glasses.json'),
      ingredients: this._http.get<Array<Ingredient>>('data/ingredients.json'),
    }).subscribe((result) => {
      this.cocktails = result.cocktails
        .filter((cocktail) => cocktail.displayed || cocktail.displayed === undefined)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(
          (cocktail) =>
            new Cocktail(
              cocktail.id,
              cocktail.name,
              cocktail.recipe,
              cocktail.ingredientIds,
              cocktail.glassId,
              cocktail.garnishIds
            )
        );
      this.garnishes = result.garnishes;
      this.glasses = result.glasses;
      this.ingredients = result.ingredients;
      this.availability = (localStorage.getItem('availability') as Availability) ?? 'available'; // Triggers filtering.
    });
  }

  private _filterCocktails(): void {
    switch (this.availability) {
      case 'all':
        this.displayedCocktails = [...this.cocktails];
        break;
      case 'available':
        this.displayedCocktails = this.cocktails.filter((cocktail) => cocktail.isAvailable());
        break;
      case 'unavailable':
        this.displayedCocktails = this.cocktails.filter((cocktail) => !cocktail.isAvailable());
        break;
      default:
        this.displayedCocktails = [];
    }

    if (this.filters.length) {
      this.displayedCocktails = this.displayedCocktails.filter((cocktail) => {
        const ingredientIds = cocktail.ingredientIds.map((ingredientId) => ingredientId.id);
        return this.filters.every((filter) => ingredientIds.includes(filter));
      });
    }
  }
}
