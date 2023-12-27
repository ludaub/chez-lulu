import { Component, HostBinding, Injector, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { AppStore } from '@app/app.store.service';
import { CocktailDetailDialogComponent } from '@app/cocktails/cocktail-detail-dialog/cocktail-detail-dialog.component';
import { Cocktail } from '@app/cocktails/shared/cocktail';
import { CocktailService } from '@app/cocktails/shared/cocktail.service';
import { FiltersDialogComponent } from '@app/core/filters/filters-dialog/filters-dialog.component';
import { ThemeService } from '@app/core/theme/theme.service';
import { Ingredient } from '@app/shared/models/ingredient';
import { Availability } from '@app/shared/typings/availability';
import { AppliedTheme } from '@app/shared/typings/theme';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @HostBinding('class') private _class: AppliedTheme;
  private readonly _destroyed$: Subject<null> = new Subject<null>();

  constructor(
    public store: AppStore,
    private _cocktailService: CocktailService,
    private _dialog: MatDialog,
    private _injector: Injector
  ) {
    // Injects `ThemeService`, just to initialize it.
    this._injector.get(ThemeService);

    this._class = this.store.appliedTheme;
  }

  ngOnInit(): void {
    this.store.appliedTheme$.pipe(distinctUntilChanged(), takeUntil(this._destroyed$)).subscribe((theme) => {
      this._class = theme;
    });
  }

  getCocktailsByAvailability(availability: Availability): Array<Cocktail> {
    return this._cocktailService.getByAvailability(availability);
  }

  identifyCocktail(index: number, cocktail: Cocktail): Cocktail['id'] {
    return cocktail.id;
  }

  getGlassIconByCocktail(cocktail: Cocktail): string {
    return this.store.glasses.find((glass) => glass.id === cocktail.glassId)?.icon ?? '';
  }

  isIngredientFiltered(ingredient: Ingredient): boolean {
    return this.store.filters.includes(ingredient.id);
  }

  openCocktailDetailDialog(cocktail: Cocktail): void {
    this._dialog.open(CocktailDetailDialogComponent, { data: cocktail, panelClass: 'cocktail-detail' });
  }

  openfiltersDialog(): void {
    this._dialog.open(FiltersDialogComponent, { panelClass: 'filters-dialog' });
  }

  ngOnDestroy(): void {
    this._destroyed$.next(null);
    this._destroyed$.complete();
  }
}
