import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AppStore } from '@app/app.store.service';
import { Cocktail } from '@app/cocktails/shared/cocktail';
import { Garnish } from '@app/shared/models/garnish';

@Component({
  selector: 'app-cocktail-detail',
  templateUrl: './cocktail-detail-dialog.component.html',
})
export class CocktailDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public cocktail: Cocktail, private _store: AppStore) {}

  getGarnishNameById(garnishId: Garnish['id']): Garnish['name'] {
    return this._store.garnishes.find((garnish) => garnish.id === garnishId)?.name ?? '';
  }
}
