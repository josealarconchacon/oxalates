/**
 * Example environment configuration.
 * Copy this file to environment.ts and environment.development.ts,
 * then replace placeholder values with your actual credentials.
 * Never commit real credentials to version control.
 */

export const environment = {
  production: false,
  emailJs: {
    serviceId: 'YOUR_EMAILJS_SERVICE_ID',
    templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
  },
  firebaseConfig: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_FIREBASE_AUTH_DOMAIN',
    projectId: 'YOUR_FIREBASE_PROJECT_ID',
    storageBucket: 'YOUR_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'YOUR_FIREBASE_APP_ID',
    measurementId: 'YOUR_FIREBASE_MEASUREMENT_ID',
  },
};
