import { NgModule } from '@angular/core';

import { FiltersDialogComponent } from '@app/core/filters/filters-dialog/filters-dialog.component';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  declarations: [FiltersDialogComponent],
  imports: [SharedModule],
})
export class FiltersModule {}
