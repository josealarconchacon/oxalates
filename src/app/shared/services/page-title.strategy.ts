import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/**
 * Gives every route a title that says what the page is for, then adds the site
 * name: "Search foods by oxalate level – Oxalate Info". Routes opt in with a
 * `title` in the routing table; one without a title falls back to the site name.
 */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  static readonly SITE_NAME = 'Oxalate Info';

  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    this.title.setTitle(
      pageTitle
        ? `${pageTitle} – ${PageTitleStrategy.SITE_NAME}`
        : PageTitleStrategy.SITE_NAME
    );
  }
}
