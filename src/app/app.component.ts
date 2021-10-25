import { HttpClient } from '@angular/common/http';
import { Component, HostBinding, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';

import { BehaviorSubject, Observable, Subject, forkJoin } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { Cocktail } from './cocktail';
import { Garnish } from './garnish';
import { Glass } from './glass';
import { Ingredient } from './ingredient';
import { ThemeService } from './theme.service';

type Availability = 'all' | 'available' | 'unavailable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
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
    this.filterCocktails();
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
    this.filterCocktails();
  }
  private readonly _filters = new BehaviorSubject<Array<Ingredient['id']>>([]);
  readonly filters$ = this._filters as Observable<Array<Ingredient['id']>>;

  @ViewChild('cocktailDetailDialog') cocktailDetailDialog!: TemplateRef<{ cocktail: Cocktail }>;
  @ViewChild('filtersDialog') filtersDialog!: TemplateRef<any>;
  @HostBinding('class') private _class!: string;
  private readonly _wordSeparatorsRegexp = /[ -]/;
  private readonly _destroyed$: Subject<null> = new Subject<null>();

  constructor(public theme: ThemeService, private _dialog: MatDialog, private _http: HttpClient) {}

  ngOnInit(): void {
    forkJoin({
      cocktails: this._http.get<Array<Cocktail>>('data/cocktails.json'),
      garnishes: this._http.get<Array<Garnish>>('data/garnishes.json'),
      glasses: this._http.get<Array<Glass>>('data/glasses.json'),
      ingredients: this._http.get<Array<Ingredient>>('data/ingredients.json'),
    })
      .pipe(takeUntil(this._destroyed$))
      .subscribe((result) => {
        this.cocktails = result.cocktails.filter((cocktail) => cocktail.displayed || cocktail.displayed === undefined);
        this.garnishes = result.garnishes;
        this.glasses = result.glasses;
        this.ingredients = result.ingredients;
        this.availability = 'available'; // Triggers filtering.
      });

    this.theme.theme$.pipe(distinctUntilChanged(), takeUntil(this._destroyed$)).subscribe((theme) => {
      this._class = theme;
    });
  }

  filterCocktails(): void {
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

  getCocktailsByAvailability(availability: Availability): Array<Cocktail> {
    let cocktails = [] as Array<Cocktail>;

    switch (availability) {
      case 'all':
        cocktails = this.cocktails;
        break;
      case 'available':
        cocktails = this.cocktails.filter((cocktail) => this.isCocktailAvailable(cocktail));
        break;
      case 'unavailable':
        cocktails = this.cocktails.filter((cocktail) => !this.isCocktailAvailable(cocktail));
        break;
      default:
        return cocktails;
    }

    if (this.filters.length) {
      cocktails = cocktails.filter((cocktail) => {
        const ingredientIds = cocktail.ingredientIds.map((ingredientId) => ingredientId.id);
        return this.filters.every((filter) => ingredientIds.includes(filter));
      });
    }

    return cocktails;
  }

  getCocktailsByIngredient(ingredient: Ingredient): Array<Cocktail> {
    return this.displayedCocktails.filter((cocktail) =>
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
    return this.glasses.find((glass) => glass.id === cocktail.glassId)?.icon ?? '';
  }

  getFilterableIngredients(): Array<Ingredient> {
    return this.ingredients
      .filter((ingredient) => this.getCocktailsByIngredient(ingredient).length > 0)
      .filter((ingredient) => ingredient.filterable || ingredient.filterable === undefined);
  }

  isCocktailAvailable(cocktail: Cocktail): boolean {
    return cocktail.ingredients.every((ingredient) => ingredient.available);
  }

  isIngredientFiltered(ingredient: Ingredient): boolean {
    return this.filters.includes(ingredient.id);
  }

  getCocktailIngredientQuantity(cocktail: Cocktail, ingredient: Ingredient): number | string {
    return cocktail.ingredientIds.find((ingredientId) => ingredientId.id === ingredient.id)?.quantity ?? '';
  }

  getCocktailIngredientUnit(cocktail: Cocktail, ingredient: Ingredient): string {
    return cocktail.ingredientIds.find((ingredientId) => ingredientId.id === ingredient.id)?.unit ?? '';
  }

  getGarnishNameById(garnishId: Garnish['id']): Garnish['name'] {
    return this.garnishes.find((garnish) => garnish.id === garnishId)?.name ?? '';
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
    this.filters = [];
  }

  isNumber(value: string): boolean {
    return !isNaN(Number(value));
  }

  ngOnDestroy(): void {
    this._destroyed$.next(null);
    this._destroyed$.complete();
  }
}
