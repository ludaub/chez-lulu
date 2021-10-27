import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, forkJoin } from 'rxjs';

import { Cocktail } from './shared/models/cocktail';
import { Garnish } from './shared/models/garnish';
import { Glass } from './shared/models/glass';
import { Ingredient } from './shared/models/ingredient';
import { Availability } from './shared/typings/availability';

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

  constructor(private _http: HttpClient) {
    forkJoin({
      cocktails: this._http.get<Array<Cocktail>>('data/cocktails.json'),
      garnishes: this._http.get<Array<Garnish>>('data/garnishes.json'),
      glasses: this._http.get<Array<Glass>>('data/glasses.json'),
      ingredients: this._http.get<Array<Ingredient>>('data/ingredients.json'),
    }).subscribe((result) => {
      this.cocktails = result.cocktails.filter((cocktail) => cocktail.displayed || cocktail.displayed === undefined);
      this.garnishes = result.garnishes;
      this.glasses = result.glasses;
      this.ingredients = result.ingredients;
      this.availability = 'available'; // Triggers filtering.
    });
  }

  isCocktailAvailable(cocktail: Cocktail): boolean {
    return cocktail.ingredients.every((ingredient) => ingredient.available);
  }

  private _filterCocktails(): void {
    switch (this.availability) {
      case 'all':
        this.displayedCocktails = [...this.cocktails];
        break;
      case 'available':
        this.displayedCocktails = this.cocktails.filter((cocktail) => this.isCocktailAvailable(cocktail));
        break;
      case 'unavailable':
        this.displayedCocktails = this.cocktails.filter((cocktail) => !this.isCocktailAvailable(cocktail));
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
