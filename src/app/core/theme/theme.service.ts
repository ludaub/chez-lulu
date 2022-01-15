import { MediaMatcher } from '@angular/cdk/layout';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Injectable } from '@angular/core';

import { distinctUntilChanged } from 'rxjs/operators';

import { AppService } from '@app/app.service';
import { AppliedTheme, Theme } from '@app/shared/typings/theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _themes = ['dark-theme', 'light-theme'];

  constructor(
    private _app: AppService,
    private _appRef: ApplicationRef,
    private _media: MediaMatcher,
    private _overlayContainer: OverlayContainer
  ) {
    const darkModeQuery = this._media.matchMedia('(prefers-color-scheme: dark)');
    const lightModeQuery = this._media.matchMedia('(prefers-color-scheme: light)');
    this._app.hasSystemTheme = darkModeQuery.matches || lightModeQuery.matches;

    const listener = (event: MediaQueryListEvent): void => {
      this._app.appliedTheme = event.matches ? 'dark-theme' : 'light-theme';
      this._appRef.tick();
    };

    if (localStorage.getItem('theme')) {
      this._app.selectedTheme = localStorage.getItem('theme') as Theme;
      this._app.appliedTheme = localStorage.getItem('theme') as AppliedTheme;
    }

    this._app.selectedTheme$.pipe(distinctUntilChanged()).subscribe((theme) => {
      localStorage.setItem('theme', theme);

      if (theme === 'system-theme') {
        theme = darkModeQuery.matches ? 'dark-theme' : 'light-theme';
        darkModeQuery.addEventListener('change', listener);
      } else {
        darkModeQuery.removeEventListener('change', listener);
      }

      this._app.appliedTheme = theme;
    });

    this._app.appliedTheme$.pipe(distinctUntilChanged()).subscribe((theme) => {
      this._overlayContainer.getContainerElement().classList.remove(...this._themes);
      this._overlayContainer.getContainerElement().classList.add(theme as AppliedTheme);
    });
  }
}
