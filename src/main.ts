import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { enableProdMode, NgModuleRef } from '@angular/core';
import { environment } from './environments/environment';

// Extend Window interface to include our custom properties
declare global {
  interface Window {
    ngRef?: NgModuleRef<AppModule>;
  }
}

// Enable production mode if needed
if (environment.production) {
  enableProdMode();
}

// Bootstrap the application with error handling
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then((ref) => {
    // For older browsers: ensure proper cleanup on window unload
    if (window.ngRef) {
      window.ngRef.destroy();
    }
    window.ngRef = ref;

    // Add unload handler for cleanup
    window.addEventListener('unload', () => {
      ref.destroy();
    });
  })
  .catch((err) => console.error('Error bootstrapping application:', err));
