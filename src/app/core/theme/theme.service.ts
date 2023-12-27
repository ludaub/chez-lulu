import { MediaMatcher } from '@angular/cdk/layout';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Injectable } from '@angular/core';

import { distinctUntilChanged } from 'rxjs/operators';

import { AppStore } from '@app/app.store.service';
import { AppliedTheme, Theme } from '@app/shared/typings/theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _themes = ['dark-theme', 'light-theme'];

  constructor(
    private _appRef: ApplicationRef,
    private _media: MediaMatcher,
    private _overlayContainer: OverlayContainer,
    private _store: AppStore
  ) {
    const darkModeQuery = this._media.matchMedia('(prefers-color-scheme: dark)');
    const lightModeQuery = this._media.matchMedia('(prefers-color-scheme: light)');
    this._store.hasSystemTheme = darkModeQuery.matches || lightModeQuery.matches;

    const listener = (event: MediaQueryListEvent): void => {
      this._store.appliedTheme = event.matches ? 'dark-theme' : 'light-theme';
      this._appRef.tick();
    };

    if (localStorage.getItem('theme')) {
      this._store.selectedTheme = localStorage.getItem('theme') as Theme;
      this._store.appliedTheme = localStorage.getItem('theme') as AppliedTheme;
    }

    this._store.selectedTheme$.pipe(distinctUntilChanged()).subscribe((theme) => {
      localStorage.setItem('theme', theme);

      if (theme === 'system-theme') {
        theme = darkModeQuery.matches ? 'dark-theme' : 'light-theme';
        darkModeQuery.addEventListener('change', listener);
      } else {
        darkModeQuery.removeEventListener('change', listener);
      }

      this._store.appliedTheme = theme;
    });

    this._store.appliedTheme$.pipe(distinctUntilChanged()).subscribe((theme) => {
      this._overlayContainer.getContainerElement().classList.remove(...this._themes);
      this._overlayContainer.getContainerElement().classList.add(theme as AppliedTheme);
    });
  }
}
