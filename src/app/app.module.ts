import { NgModule } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from '@app/app.component';
import { CocktailsModule } from '@app/cocktails/cocktails.module';
import { FiltersModule } from '@app/core/filters/filters.module';
import { SharedModule } from '@app/shared/shared.module';
import { environment } from '@env/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    CocktailsModule,
    FiltersModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    SharedModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
