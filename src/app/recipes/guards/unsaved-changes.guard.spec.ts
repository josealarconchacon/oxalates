import { unsavedChangesGuard } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  const run = (answer: boolean | Promise<boolean>) =>
    (unsavedChangesGuard as any)({ canLeave: () => answer }, null, null, null);

  it("passes on the page's answer", async () => {
    expect(run(true)).toBeTrue();
    expect(run(false)).toBeFalse();
    expect(await run(Promise.resolve(true))).toBeTrue();
  });
});
