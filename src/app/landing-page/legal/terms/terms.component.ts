import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Terms of use. Google's OAuth consent screen links here. */
@Component({
  selector: 'app-terms',
  imports: [RouterLink],
  templateUrl: './terms.component.html',
  styleUrls: ['../legal-page.css'],
})
export class TermsComponent {}
