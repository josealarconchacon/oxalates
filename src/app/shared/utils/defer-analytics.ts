type IdleWindow = Pick<Window, 'addEventListener' | 'setTimeout'> & {
  document: Pick<Document, 'readyState'>;
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
};

/** Longest we wait for the browser to be idle before starting anyway. */
const IDLE_TIMEOUT_MS = 4000;

export function whenPageIsIdle(
  start: () => void,
  win: IdleWindow = window,
): void {
  let started = false;
  const run = () => {
    if (started) return;
    started = true;
    start();
  };
  const scheduleIdle = () => {
    if (win.requestIdleCallback) {
      win.requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS });
    } else {
      win.setTimeout(run, 2000);
    }
  };

  if (win.document.readyState === 'complete') {
    scheduleIdle();
  } else {
    win.addEventListener('load', scheduleIdle, { once: true });
  }
}

export interface AnalyticsApp {
  analytics(): unknown;
}

export interface AnalyticsLoaders {
  isSupported: () => Promise<boolean>;
  loadCompat: () => Promise<unknown>;
}

const defaultLoaders: AnalyticsLoaders = {
  isSupported: () => import('firebase/analytics').then((m) => m.isSupported()),
  loadCompat: () => import('firebase/compat/analytics'),
};

export async function startAnalytics(
  app: AnalyticsApp,
  loaders: AnalyticsLoaders = defaultLoaders,
): Promise<boolean> {
  try {
    if (!(await loaders.isSupported())) {
      return false;
    }
    await loaders.loadCompat();
    app.analytics();
    return true;
  } catch {
    return false;
  }
}
