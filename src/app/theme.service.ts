import { MediaMatcher } from '@angular/cdk/layout';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  get theme(): 'dark-theme' | 'light-theme' {
    return this._theme.getValue();
  }
  set theme(theme: 'dark-theme' | 'light-theme') {
    this._theme.next(theme);
  }
  private readonly _theme = new BehaviorSubject<'dark-theme' | 'light-theme'>('light-theme');
  readonly theme$ = this._theme as Observable<'dark-theme' | 'light-theme'>;

  private _themes = ['dark-theme', 'light-theme'];

  constructor(private _app: ApplicationRef, private _media: MediaMatcher, private _overlayContainer: OverlayContainer) {
    const darkModeQuery = this._media.matchMedia('(prefers-color-scheme: dark)');

    if (darkModeQuery.matches) {
      this._theme.next('dark-theme');
    }

    darkModeQuery.addListener((event) => {
      this._theme.next(event.matches ? 'dark-theme' : 'light-theme');
      this._app.tick();
    });

    this._theme.subscribe((theme) => {
      this._overlayContainer.getContainerElement().classList.remove(...this._themes);
      this._overlayContainer.getContainerElement().classList.add(theme);
    });
  }
}
