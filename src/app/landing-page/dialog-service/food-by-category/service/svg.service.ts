import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SvgService {
  constructor(private sanitizer: DomSanitizer) {}

  sanitizeAndPrepareSvg(svg: string): SafeHtml {
    if (!svg) {
      console.warn('Missing SVG, using default.');
      return this.getDefaultSvg();
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

      return this.sanitizer.bypassSecurityTrustHtml(normalizedSvg);
    } catch (error) {
      console.error('Error sanitizing SVG:', svg, error);
      return this.getDefaultSvg();
    }
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
}
