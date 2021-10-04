import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonToggleChange } from "@angular/material/button-toggle";

import { BehaviorSubject, Observable, Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Cocktail } from './cocktail';
import { Garnish } from './garnish';
import { Glass } from './glass';
import { Ingredient } from './ingredient';

type Availability = 'all' | 'available' | 'unavailable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  /**
   * Cocktails data.
   */
  get cocktails(): Array<Cocktail> { return this._cocktails.getValue(); }
  set cocktails(cocktails: Array<Cocktail>) { this._cocktails.next(cocktails); }
  private readonly _cocktails = new BehaviorSubject<Array<Cocktail>>([]);
  readonly cocktails$ = this._cocktails as Observable<Array<Cocktail>>;

  /**
   * Displayed cocktails.
   */
  get displayedCocktails(): Array<Cocktail> { return this._displayedCocktails.getValue(); }
  set displayedCocktails(cocktails: Array<Cocktail>) { this._displayedCocktails.next(cocktails); }
  private readonly _displayedCocktails = new BehaviorSubject<Array<Cocktail>>([]);
  readonly displayedCocktails$ = this._displayedCocktails as Observable<Array<Cocktail>>;

  /**
   * Garnishes data.
   */
  get garnishes(): Array<Garnish> { return this._garnishes.getValue(); }
  set garnishes(garnishes: Array<Garnish>) { this._garnishes.next(garnishes); }
  private readonly _garnishes = new BehaviorSubject<Array<Garnish>>([]);
  readonly garnishes$ = this._garnishes as Observable<Array<Garnish>>;

  /**
   * Glasses data.
   */
  get glasses(): Array<Glass> { return this._glasses.getValue(); }
  set glasses(glasses: Array<Glass>) { this._glasses.next(glasses); }
  private readonly _glasses = new BehaviorSubject<Array<Glass>>([]);
  readonly glasses$ = this._glasses as Observable<Array<Glass>>;

  /**
   * Ingredients data.
   */
  get ingredients(): Array<Ingredient> { return this._ingredients.getValue(); }
  set ingredients(ingredients: Array<Ingredient>) {
    this._ingredients.next(ingredients);

    // Set ingredients in cocktails.
    for (const cocktail of this.cocktails) {
      cocktail.ingredients = [];

      for (const ingredientId of cocktail.ingredientIds) {
        cocktail.ingredients.push(this.ingredients.find(ingredient => ingredient.id === ingredientId.id)!);
      }
    }
  }
  private readonly _ingredients = new BehaviorSubject<Array<Ingredient>>([]);
  readonly ingredients$ = this._ingredients as Observable<Array<Ingredient>>;

  /**
   * Availabilities. Used as value by availability toggle.
   */
  get availabilities(): Array<Availability> { return this._availabilities.getValue(); }
  set availabilities(values: Array<Availability>) {
    this._availabilities.next(values);
    this.filterCocktails();
  }
  private readonly _availabilities = new BehaviorSubject<Array<Availability>>([]);
  readonly availabilities$ = this._availabilities as Observable<Array<Availability>>;

  /**
   * Filters (ingredient IDs).
   */
  get filters(): Array<Ingredient['id']> { return this._filters.getValue(); }
  set filters(filters: Array<Ingredient['id']>) {
    this._filters.next(filters);
    this.filterCocktails();
  }
  private readonly _filters = new BehaviorSubject<Array<Ingredient['id']>>([]);
  readonly filters$ = this._filters as Observable<Array<Ingredient['id']>>;

  private readonly _destroyed$: Subject<null> = new Subject<null>();

  constructor(private _http: HttpClient) {}

  ngOnInit() {
    forkJoin(
      {
        cocktails: this._http.get<Array<Cocktail>>('data/cocktails.json'),
        garnishes: this._http.get<Array<Garnish>>('data/garnishes.json'),
        glasses: this._http.get<Array<Glass>>('data/glasses.json'),
        ingredients: this._http.get<Array<Ingredient>>('data/ingredients.json')
      }
    ).pipe(
      takeUntil(this._destroyed$)
    ).subscribe(result => {
      this.cocktails = result.cocktails;
      this.garnishes = result.garnishes;
      this.glasses = result.glasses;
      this.ingredients = result.ingredients;
      this.availabilities = ['all', 'available', 'unavailable'];
    });
  }

  filterCocktails() {
    if (this.availabilities.includes('all')) {
      this.displayedCocktails = [...this.cocktails];
    } else if (this.availabilities.includes('available')) {
      this.displayedCocktails = this.cocktails.filter(cocktail => this.isCocktailAvailable(cocktail));
    } else if (this.availabilities.includes('unavailable')) {
      this.displayedCocktails = this.cocktails.filter(cocktail => !this.isCocktailAvailable(cocktail));
    } else {
      this.displayedCocktails = [];
    }

    if (this.filters.length) {
      this.displayedCocktails = this.displayedCocktails.filter(cocktail => {
        const ingredientIds = cocktail.ingredientIds.map(ingredientId => ingredientId.id);

        return this.filters.every(filter => ingredientIds.includes(filter));
      });
    }
  }

  getCocktailsByAvailability(availability: Availability): Array<Cocktail> {
    let cocktails = [] as Array<Cocktail>;

    switch (availability) {
      case 'all':
        cocktails = this.cocktails;
        break;
      case 'available':
        cocktails = this.cocktails.filter(cocktail => this.isCocktailAvailable(cocktail));
        break;
      case 'unavailable':
        cocktails = this.cocktails.filter(cocktail => !this.isCocktailAvailable(cocktail));
        break;
      default:
        return cocktails;
    }

    if (this.filters.length) {
      cocktails = cocktails.filter(cocktail => {
        const ingredientIds = cocktail.ingredientIds.map(ingredientId => ingredientId.id);

        return this.filters.every(filter => ingredientIds.includes(filter));
      });
    }

    return cocktails;
  }

  getCocktailsByIngredient(ingredient: Ingredient): Array<Cocktail> {
    return this.displayedCocktails.filter(cocktail => cocktail.ingredientIds
      .map(ingredientId => ingredientId.id)
      .some(id => id === ingredient.id)
    );
  }

  getGlassIconByCocktail(cocktail: Cocktail): string {
    return this.glasses.find(glass => glass.id === cocktail.glassId)!['icon'];
  }

  getFilterableIngredients(): Array<Ingredient> {
    return this.ingredients.filter(ingredient => this.getCocktailsByIngredient(ingredient).length > 0)
      .filter(ingredient => ingredient.filterable || ingredient.filterable === undefined);
  }

  isCocktailAvailable(cocktail: Cocktail): boolean {
    return cocktail.ingredients.every(ingredient => ingredient.available);
  }

  isIngredientFiltered(ingredient: Ingredient): boolean {
    return this.filters.includes(ingredient.id);
  }

  setAvailability(event: MatButtonToggleChange) {
    switch (event.value) {
      case 'all':
        this.availabilities = this.availabilities.includes('all')
          ? []
          : ['all', 'available', 'unavailable'];
        break;
      case 'available':
        if (!this.availabilities.length) {
          this.availabilities = ['available'];
        } else if (this.availabilities.includes('all')) {
          this.availabilities = ['unavailable'];
        } else if (this.availabilities.length === 1 && this.availabilities.includes('unavailable')) {
          this.availabilities = ['all', 'available', 'unavailable'];
        } else {
          this.availabilities = [];
        }

        break;
      case 'unavailable':
        if (!this.availabilities.length) {
          this.availabilities = ['unavailable'];
        } else if (this.availabilities.includes('all')) {
          this.availabilities = ['available'];
        } else if (this.availabilities.length === 1 && this.availabilities.includes('available')) {
          this.availabilities = ['all', 'available', 'unavailable'];
        } else {
          this.availabilities = [];
        }

        break;
      default:
        this.availabilities = [];
        break;
    }
  }

  toggleFilter(event: MatButtonToggleChange) {
    event.source.buttonToggleGroup.value = null;
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
