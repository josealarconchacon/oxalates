import { startAnalytics, whenPageIsIdle } from './defer-analytics';

describe('whenPageIsIdle', () => {
  /** A window whose load event, idle moments and timers the spec controls. */
  const fakeWindow = (readyState: string, withIdleCallback = true) => {
    const listeners: Record<string, () => void> = {};
    const idleQueue: Array<() => void> = [];
    const timers: Array<() => void> = [];
    const win: any = {
      document: { readyState },
      addEventListener: jasmine
        .createSpy('addEventListener')
        .and.callFake((type: string, fn: () => void) => (listeners[type] = fn)),
      setTimeout: jasmine
        .createSpy('setTimeout')
        .and.callFake((fn: () => void) => timers.push(fn)),
    };
    if (withIdleCallback) {
      win.requestIdleCallback = jasmine
        .createSpy('requestIdleCallback')
        .and.callFake((fn: () => void) => idleQueue.push(fn));
    }
    return {
      win,
      fireLoad: () => listeners['load']?.(),
      runIdle: () => idleQueue.splice(0).forEach((fn) => fn()),
      runTimers: () => timers.splice(0).forEach((fn) => fn()),
    };
  };

  it('does not start while the page is still loading', () => {
    const { win } = fakeWindow('loading');
    const start = jasmine.createSpy('start');

    whenPageIsIdle(start, win);

    expect(start).not.toHaveBeenCalled();
  });

  it('does not start straight after the load event, only when the browser is idle', () => {
    const page = fakeWindow('loading');
    const start = jasmine.createSpy('start');
    whenPageIsIdle(start, page.win);

    page.fireLoad();
    expect(start).not.toHaveBeenCalled();

    page.runIdle();
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('waits for an idle moment even when the page has already loaded', () => {
    const page = fakeWindow('complete');
    const start = jasmine.createSpy('start');

    whenPageIsIdle(start, page.win);
    expect(start).not.toHaveBeenCalled();

    page.runIdle();
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('asks for a timeout, so a busy page cannot postpone it forever', () => {
    const page = fakeWindow('complete');

    whenPageIsIdle(() => undefined, page.win);

    expect(page.win.requestIdleCallback).toHaveBeenCalledWith(
      jasmine.any(Function),
      { timeout: 4000 }
    );
  });

  it('falls back to a timer where requestIdleCallback does not exist (Safari)', () => {
    const page = fakeWindow('complete', false);
    const start = jasmine.createSpy('start');

    whenPageIsIdle(start, page.win);
    expect(start).not.toHaveBeenCalled();

    page.runTimers();
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('starts only once, however many times it is triggered', () => {
    const page = fakeWindow('complete');
    const start = jasmine.createSpy('start');
    whenPageIsIdle(start, page.win);

    page.runIdle();
    page.runIdle();

    expect(start).toHaveBeenCalledTimes(1);
  });
});

describe('startAnalytics', () => {
  const app = () => ({ analytics: jasmine.createSpy('analytics') });
  const loaders = (supported: boolean) => ({
    isSupported: jasmine.createSpy('isSupported').and.resolveTo(supported),
    loadCompat: jasmine.createSpy('loadCompat').and.resolveTo({}),
  });

  it('loads the SDK and starts analytics when the browser supports it', async () => {
    const firebaseApp = app();
    const l = loaders(true);

    const started = await startAnalytics(firebaseApp, l);

    expect(started).toBeTrue();
    expect(l.loadCompat).toHaveBeenCalledTimes(1);
    expect(firebaseApp.analytics).toHaveBeenCalledTimes(1);
  });

  it('does not load anything where analytics is not supported', async () => {
    const firebaseApp = app();
    const l = loaders(false);

    const started = await startAnalytics(firebaseApp, l);

    expect(started).toBeFalse();
    expect(l.loadCompat).not.toHaveBeenCalled();
    expect(firebaseApp.analytics).not.toHaveBeenCalled();
  });

  it('never throws when the SDK fails to load (offline, blocked by an ad blocker)', async () => {
    const firebaseApp = app();
    const l = loaders(true);
    l.loadCompat.and.rejectWith(new Error('chunk failed'));

    await expectAsync(startAnalytics(firebaseApp, l)).toBeResolvedTo(false);
    expect(firebaseApp.analytics).not.toHaveBeenCalled();
  });

  it('never throws when starting analytics itself fails', async () => {
    const firebaseApp = app();
    firebaseApp.analytics.and.throwError('no measurement id');

    await expectAsync(startAnalytics(firebaseApp, loaders(true))).toBeResolvedTo(
      false
    );
  });
});
