import { Component, HostBinding, Injector, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';

import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { AppService } from '@app/app.service';
import { CocktailDetailDialogComponent } from '@app/cocktails/cocktail-detail-dialog/cocktail-detail-dialog.component';
import { Cocktail } from '@app/cocktails/shared/cocktail';
import { ThemeService } from '@app/core/theme.service';
import { Ingredient } from '@app/shared/models/ingredient';
import { Availability } from '@app/shared/typings/availability';
import { AppliedTheme } from '@app/shared/typings/theme';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('filtersDialog') filtersDialog!: TemplateRef<any>;
  @HostBinding('class') private _class!: AppliedTheme;
  private readonly _destroyed$: Subject<null> = new Subject<null>();

  constructor(public app: AppService, private _dialog: MatDialog, private _injector: Injector) {
    // Injects `ThemeService`, just to initialize it.
    this._injector.get(ThemeService);
  }

  ngOnInit(): void {
    this.app.appliedTheme$.pipe(distinctUntilChanged(), takeUntil(this._destroyed$)).subscribe((theme) => {
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
        cocktails = this.app.cocktails.filter((cocktail) => cocktail.isAvailable());
        break;
      case 'unavailable':
        cocktails = this.app.cocktails.filter((cocktail) => !cocktail.isAvailable());
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

  getGlassIconByCocktail(cocktail: Cocktail): string {
    return this.app.glasses.find((glass) => glass.id === cocktail.glassId)?.icon ?? '';
  }

  getFilterableIngredients(): Array<Ingredient> {
    return this.app.ingredients
      .filter((ingredient) => this.getCocktailsByIngredient(ingredient).length > 0)
      .filter((ingredient) => ingredient.filterable || ingredient.filterable === undefined);
  }

  isIngredientFiltered(ingredient: Ingredient): boolean {
    return this.app.filters.includes(ingredient.id);
  }

  toggleFilter(event: MatButtonToggleChange): void {
    event.source.buttonToggleGroup.value = null;
  }

  openCocktailDetailDialog(cocktail: Cocktail): void {
    this._dialog.open(CocktailDetailDialogComponent, { data: cocktail, panelClass: 'cocktail-detail' });
  }

  openfiltersDialog(): void {
    this._dialog.open(this.filtersDialog, { panelClass: 'filters-dialog' });
  }

  resetFilters(): void {
    this.app.filters = [];
  }

  ngOnDestroy(): void {
    this._destroyed$.next(null);
    this._destroyed$.complete();
  }
}
