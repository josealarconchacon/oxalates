import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Injectable({
  providedIn: 'root',
})
export class SvgService {
  private svgCache = new Map<string, SafeHtml>();

  constructor(private sanitizer: DomSanitizer) {}

  sanitizeAndPrepareSvg(svg: string): SafeHtml {
    if (!svg) {
      console.warn('Missing SVG, using default.');
      return this.getDefaultSvg();
    }

    // Check cache first
    if (this.svgCache.has(svg)) {
      return this.svgCache.get(svg)!;
    }

    try {
      let normalizedSvg = svg.trim();
      if (!normalizedSvg.includes('xmlns')) {
        normalizedSvg = normalizedSvg.replace(
          '<svg',
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }
      if (!normalizedSvg.includes('viewBox')) {
        normalizedSvg = normalizedSvg.replace(
          '<svg',
          '<svg viewBox="0 0 24 24"'
        );
      }

      // Strip any executable content (script tags, event handler
      // attributes, javascript: URIs, foreignObject) before trusting the
      // markup. Angular's own sanitizer would strip valid SVG elements too,
      // so we clean the string ourselves and only then bypass Angular's
      // sanitizer on the already-safe result.
      const cleanSvg = DOMPurify.sanitize(normalizedSvg, {
        USE_PROFILES: { svg: true, svgFilters: true },
        FORBID_TAGS: ['foreignObject', 'script'],
      });

      if (!this.isSvgValid(cleanSvg)) {
        console.warn('SVG failed sanitization, using default:', svg);
        return this.getDefaultSvg();
      }

      const sanitizedSvg = this.sanitizer.bypassSecurityTrustHtml(cleanSvg);

      // Cache the result
      this.svgCache.set(svg, sanitizedSvg);

      return sanitizedSvg;
    } catch (error) {
      console.error('Error sanitizing SVG:', svg, error);
      return this.getDefaultSvg();
    }
  }

  private isSvgValid(svg: string): boolean {
    const trimmed = svg.trim();
    return trimmed.startsWith('<svg') && trimmed.endsWith('</svg>');
  }

  private getDefaultSvg(): SafeHtml {
    const defaultSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
        <rect width="24" height="24" fill="#e0e0e0"/>
        <text x="12" y="12" font-size="8" fill="#666" text-anchor="middle" dy=".3em">Icon</text>
      </svg>
    `;
    return this.sanitizer.bypassSecurityTrustHtml(defaultSvg);
  }

  // Clear cache if needed
  clearCache(): void {
    this.svgCache.clear();
  }
}
