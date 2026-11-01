import { of, throwError } from 'rxjs';
import { GetReportComponent } from './get-report.component';

/**
 * The PDF libraries are loaded on the first "Download PDF" click, not with the
 * app. These specs run downloadPDF on a real component instance created without
 * its injected services, so they need neither Firebase nor a signed-in user.
 */
describe('GetReportComponent downloadPDF (lazy PDF libraries)', () => {
  const entry = {
    breakfast: [
      {
        foodName: 'Oats, Quick, dry',
        servingSize: '1/2 cup',
        numberOfServings: 2,
        oxalatePerServing: 10,
        solubleOxalatePerServing: 4,
      },
    ],
  };
  const selectedDate = new Date(2026, 9, 31);
  const expectedName = (() => {
    const d = new Date(selectedDate);
    d.setHours(0, 0, 0, 0);
    return `Oxalate_Report_${d.toISOString().split('T')[0]}.pdf`;
  })();

  let alertService: { showAlert: jasmine.Spy };
  let getDailyEntry: jasmine.Spy;

  const make = (daily: unknown) => {
    getDailyEntry = jasmine.createSpy('getDailyEntry').and.returnValue(daily);
    alertService = { showAlert: jasmine.createSpy('showAlert') };
    return Object.assign(Object.create(GetReportComponent.prototype), {
      foodEntryService: { getDailyEntry },
      alertService,
      selectedDate,
      isPreparingPdf: false,
    }) as GetReportComponent;
  };

  /** downloadPDF returns before the libraries finish loading. */
  const untilDone = async (component: GetReportComponent) => {
    for (let i = 0; i < 200 && component.isPreparingPdf; i++) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  };

  /** A stand-in document, so no spec triggers a real browser download. */
  let fakeDoc: { save: jasmine.Spy };
  const withFakeDoc = (component: GetReportComponent) => {
    fakeDoc = { save: jasmine.createSpy('save') };
    spyOn(component as any, 'buildPdf').and.resolveTo(fakeDoc);
  };

  it('builds and saves a PDF named for the selected day', async () => {
    const component = make(of(entry));
    withFakeDoc(component);

    component.downloadPDF();
    await untilDone(component);

    expect(fakeDoc.save).toHaveBeenCalledOnceWith(expectedName);
    expect(alertService.showAlert).not.toHaveBeenCalled();
    expect(component.isPreparingPdf).toBeFalse();
  });

  it('shows it is preparing while the libraries load, and ignores a second click', async () => {
    const component = make(of(entry));
    withFakeDoc(component);

    component.downloadPDF();
    component.downloadPDF();

    expect(component.isPreparingPdf).toBeTrue();
    expect(getDailyEntry).toHaveBeenCalledTimes(1);
    await untilDone(component);
    expect(fakeDoc.save).toHaveBeenCalledTimes(1);
  });

  it('tells the person when there is nothing to export, and re-enables the button', () => {
    const component = make(of({}));

    component.downloadPDF();

    expect(alertService.showAlert).toHaveBeenCalledWith(
      'No data available for selected date!'
    );
    expect(component.isPreparingPdf).toBeFalse();
  });

  it('shows an error and re-enables the button when the entry cannot be read', () => {
    spyOn(console, 'error');
    const component = make(throwError(() => new Error('offline')));

    component.downloadPDF();

    expect(alertService.showAlert).toHaveBeenCalledWith(
      'Error downloading report. Please try again.'
    );
    expect(component.isPreparingPdf).toBeFalse();
  });

  it('shows an error and re-enables the button when the PDF libraries fail to load', async () => {
    spyOn(console, 'error');
    const component = make(of(entry));
    spyOn(component as any, 'buildPdf').and.rejectWith(
      new Error('chunk failed to load')
    );

    component.downloadPDF();
    await untilDone(component);

    expect(alertService.showAlert).toHaveBeenCalledWith(
      'Error downloading report. Please try again.'
    );
    expect(component.isPreparingPdf).toBeFalse();
  });

  it('really produces a PDF document from the lazily loaded libraries', async () => {
    const component = make(of(entry));

    const doc = await (component as any).buildPdf(entry, selectedDate);

    const bytes = new Uint8Array(doc.output('arraybuffer'));
    expect(String.fromCharCode(...bytes.slice(0, 5))).toBe('%PDF-');
    expect(doc.getNumberOfPages()).toBe(1);
  });
});
