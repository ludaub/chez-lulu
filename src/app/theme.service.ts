import { MediaMatcher } from '@angular/cdk/layout';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

type Theme = 'dark-theme' | 'light-theme' | 'system-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  /**
   * Application theme.
   */
  get theme(): Theme {
    return this._theme.getValue();
  }
  set theme(theme: Theme) {
    this._theme.next(theme);
  }
  private readonly _theme = new BehaviorSubject<Theme>('light-theme');
  readonly theme$ = new BehaviorSubject<Theme>('light-theme');

  readonly hasThemeMediaQuery: boolean = false;
  private _themes = ['dark-theme', 'light-theme'];

  constructor(private _app: ApplicationRef, private _media: MediaMatcher, private _overlayContainer: OverlayContainer) {
    const darkModeQuery = this._media.matchMedia('(prefers-color-scheme: dark)');
    const lightModeQuery = this._media.matchMedia('(prefers-color-scheme: light)');
    this.hasThemeMediaQuery = darkModeQuery.matches || lightModeQuery.matches;

    const listener = (event: MediaQueryListEvent): void => {
      this.theme$.next(event.matches ? 'dark-theme' : 'light-theme');
      this._app.tick();
    };

    this._theme.subscribe((theme) => {
      if (theme === 'system-theme') {
        theme = darkModeQuery.matches ? 'dark-theme' : 'light-theme';
        darkModeQuery.addEventListener('change', listener);
      } else {
        darkModeQuery.removeEventListener('change', listener);
      }

      this.theme$.next(theme);
    });

    this.theme$.subscribe((theme) => {
      this._overlayContainer.getContainerElement().classList.remove(...this._themes);
      this._overlayContainer.getContainerElement().classList.add(theme);
    });
  }
}
