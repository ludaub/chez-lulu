import { NgModule } from '@angular/core';

import { CocktailDetailDialogComponent } from '@app/cocktails/cocktail-detail-dialog/cocktail-detail-dialog.component';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  declarations: [CocktailDetailDialogComponent],
  imports: [SharedModule],
})
export class CocktailsModule {}
