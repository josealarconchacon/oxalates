import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { NgModuleRef } from '@angular/core';

// Extend Window interface to include our custom properties
declare global {
  interface Window {
    ngRef?: NgModuleRef<AppModule>;
  }
}

// No enableProdMode() here: `ng build` already strips Angular's development
// checks from production builds. Calling it from the environment flag also
// switched the checks off under `ng serve`, which hid real template errors.

// Bootstrap the application with error handling
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then((ref) => {
    // For older browsers: ensure proper cleanup on window unload
    if (window.ngRef) {
      window.ngRef.destroy();
    }
    window.ngRef = ref;

    // Clean up when the page goes away. `pagehide` replaces `unload`, which
    // browsers are removing and which also stops the back/forward cache.
    window.addEventListener('pagehide', () => {
      ref.destroy();
    });
  })
  .catch((err) => console.error('Error bootstrapping application:', err));
