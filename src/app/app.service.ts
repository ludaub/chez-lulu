import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, forkJoin } from 'rxjs';

import { Cocktail } from '@app/cocktails/shared/cocktail';
import { Category } from '@app/shared/models/category';
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
  readonly cocktails$ = this._cocktails.asObservable();

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
  readonly displayedCocktails$ = this._displayedCocktails.asObservable();

  /**
   * Categories data.
   */
  get categories(): Array<Category> {
    return this._categories.getValue();
  }
  set categories(categories: Array<Category>) {
    this._categories.next(categories);
  }
  private readonly _categories = new BehaviorSubject<Array<Category>>([]);
  readonly categories$ = this._categories.asObservable();

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
  readonly garnishes$ = this._garnishes.asObservable();

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
  readonly glasses$ = this._glasses.asObservable();

  /**
   * Ingredients data.
   */
  get ingredients(): Array<Ingredient> {
    return this._ingredients.getValue();
  }
  set ingredients(ingredients: Array<Ingredient>) {
    this._ingredients.next(ingredients);

    // Set ingredients in categories.
    for (const category of this.categories) {
      category.ingredients = this.ingredients.filter((ingredient) => ingredient.categoryId === category.id);
    }

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
  readonly ingredients$ = this._ingredients.asObservable();

  /**
   * Availability. Used as value by availability toggle.
   */
  get availability(): Availability {
    return this._availability.getValue();
  }
  set availability(availability: Availability) {
    this._availability.next(availability);
    localStorage.setItem('availability', availability);
  }
  private readonly _availability = new BehaviorSubject<Availability>('available');
  readonly availability$ = this._availability.asObservable();

  /**
   * Filters (ingredient IDs).
   */
  get filters(): Array<Ingredient['id']> {
    return this._filters.getValue();
  }
  set filters(filters: Array<Ingredient['id']>) {
    this._filters.next(filters);
    localStorage.setItem('filters', JSON.stringify(filters));
  }
  private readonly _filters = new BehaviorSubject<Array<Ingredient['id']>>([]);
  readonly filters$ = this._filters.asObservable();

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
  readonly selectedTheme$ = this._selectedTheme.asObservable();

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
  readonly appliedTheme$ = this._appliedTheme.asObservable();

  /**
   * Whether user has a system theme defined.
   */
  get hasSystemTheme(): boolean {
    return this._hasSystemTheme;
  }
  set hasSystemTheme(has: boolean) {
    this._hasSystemTheme = has;
  }
  private _hasSystemTheme = false;

  constructor(private _http: HttpClient) {
    forkJoin({
      cocktails: this._http.get<Array<Cocktail>>('data/cocktails.json'),
      categories: this._http.get<Array<Category>>('data/categories.json'),
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
      this.categories = result.categories;
      this.garnishes = result.garnishes;
      this.glasses = result.glasses;
      this.ingredients = result.ingredients;
      this.filters = JSON.parse(localStorage.getItem('filters') ?? '[]');
      this.availability = (localStorage.getItem('availability') as Availability) ?? 'available'; // Triggers filtering.
    });
  }
}
