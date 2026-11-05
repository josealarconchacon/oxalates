import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Privacy policy. Google's OAuth consent screen links here, so keep it in step
 * with what the app actually collects (Firebase Auth, Firestore, Storage,
 * Analytics, EmailJS and localStorage).
 */
@Component({
  selector: 'app-privacy',
  imports: [RouterLink],
  templateUrl: './privacy.component.html',
  styleUrls: ['../legal-page.css'],
})
export class PrivacyComponent {}
