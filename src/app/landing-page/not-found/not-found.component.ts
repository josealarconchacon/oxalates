import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Shown for any URL that matches no route. It used to redirect to the sign-in
 * page, which left someone who mistyped a link on a login form with no hint
 * that the page they asked for doesn't exist.
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
})
export class NotFoundComponent {}
