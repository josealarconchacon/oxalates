// Import core-js features
import 'core-js/stable';
import 'core-js/proposals/reflect-metadata';

// Import other polyfills
import 'whatwg-fetch';
import 'intersection-observer';
import 'web-animations-js';

// Zone.js needs to be imported before Angular
import 'zone.js';

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

// Support for older browsers
if (!window.Promise) {
  window.Promise = Promise;
}

if (!window.fetch) {
  window.fetch = fetch;
}

if (!('IntersectionObserver' in window)) {
  // IntersectionObserver polyfill is already imported above
}

// Add support for passive event listeners
// This improves scrolling performance on mobile devices
let supportsPassive = false;
try {
  const opts = Object.defineProperty({}, 'passive', {
    get: function () {
      supportsPassive = true;
      return true;
    },
  });
  window.addEventListener('testPassive', null as any, opts);
  window.removeEventListener('testPassive', null as any, opts);
} catch (e) {}

// Add this to document for older browsers
document.addEventListener(
  'touchstart',
  function () {},
  supportsPassive ? { passive: true } : false
);

// Add passive scroll event listeners for better performance
document.addEventListener(
  'scroll',
  function () {},
  supportsPassive ? { passive: true } : false
);

// Add wheel event listener with passive option for better scroll performance
document.addEventListener(
  'wheel',
  function () {},
  supportsPassive ? { passive: true } : false
);

// Handle older browsers that don't support custom elements
if (!customElements.get('app-root')) {
  customElements.define(
    'app-root',
    class extends HTMLElement {
      connectedCallback() {
        this.innerHTML = '<div>Loading...</div>';
      }
    }
  );
}

// Add error handling for uncaught errors
window.addEventListener('error', function (e) {
  console.error('Global error handler:', e.error);
  // You can add error reporting service here
});
