import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgService } from './svg.service';

describe('SvgService', () => {
  let service: SvgService;
  let sanitizer: jasmine.SpyObj<DomSanitizer>;
  let consoleWarnSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    const sanitizerSpy = jasmine.createSpyObj('DomSanitizer', [
      'bypassSecurityTrustHtml',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SvgService,
        { provide: DomSanitizer, useValue: sanitizerSpy },
      ],
    });

    service = TestBed.inject(SvgService);
    sanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
    sanitizer.bypassSecurityTrustHtml.and.callFake(
      (value: string) => `sanitized:${value}` as any
    );

    consoleWarnSpy = spyOn(console, 'warn');
    consoleErrorSpy = spyOn(console, 'error');
  });

  afterEach(() => service.clearCache());

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should add missing xmlns and viewBox attributes', () => {
    service.sanitizeAndPrepareSvg('<svg><circle/></svg>');
    const result = sanitizer.bypassSecurityTrustHtml.calls.mostRecent()
      .args[0] as string;

    expect(result).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(result).toContain('viewBox="0 0 24 24"');
  });

  it('should not duplicate existing attributes', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle/></svg>';
    service.sanitizeAndPrepareSvg(svg);
    const result = sanitizer.bypassSecurityTrustHtml.calls.mostRecent()
      .args[0] as string;

    expect((result.match(/xmlns=/g) || []).length).toBe(1);
    expect((result.match(/viewBox=/g) || []).length).toBe(1);
    expect(result).toContain('viewBox="0 0 100 100"');
  });

  it('should cache sanitized SVGs', () => {
    const svg = '<svg><circle/></svg>';
    const result1 = service.sanitizeAndPrepareSvg(svg);
    const result2 = service.sanitizeAndPrepareSvg(svg);

    expect(result1).toBe(result2);
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledTimes(1);
  });

  it('should return default SVG for empty/null/undefined input', () => {
    [null, undefined, ''].forEach((input) => {
      service.sanitizeAndPrepareSvg(input as any);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Missing SVG, using default.'
      );
    });

    const result = sanitizer.bypassSecurityTrustHtml.calls.mostRecent()
      .args[0] as string;
    expect(result).toContain('Icon');
  });

  it('should handle errors and return default SVG', () => {
    let callCount = 0;
    sanitizer.bypassSecurityTrustHtml.and.callFake(() => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Sanitization failed');
      }
      return 'sanitized:default' as any;
    });

    const result = service.sanitizeAndPrepareSvg('<svg></svg>');

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  it('should clear cache and re-sanitize', () => {
    const svg = '<svg><circle/></svg>';
    service.sanitizeAndPrepareSvg(svg);
    service.clearCache();
    service.sanitizeAndPrepareSvg(svg);

    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledTimes(2);
  });
});
