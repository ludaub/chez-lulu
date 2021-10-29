import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AppService } from '@app/app.service';
import { Cocktail } from '@app/cocktails/shared/cocktail';
import { Garnish } from '@app/shared/models/garnish';

@Component({
  selector: 'app-cocktail-detail',
  templateUrl: './cocktail-detail-dialog.component.html',
})
export class CocktailDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public cocktail: Cocktail, private _app: AppService) {}

  getGarnishNameById(garnishId: Garnish['id']): Garnish['name'] {
    return this._app.garnishes.find((garnish) => garnish.id === garnishId)?.name ?? '';
  }
}
