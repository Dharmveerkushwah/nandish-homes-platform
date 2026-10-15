import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

/**
 * Applied to any content <img>. If the source 404s or the host is
 * unreachable, swap in a small inline SVG placeholder instead of leaving the
 * browser's broken-image icon on screen (gap doc item 22 - image fallback).
 */
@Directive({
  selector: 'img[nhImgFallback]',
  standalone: true,
})
export class ImgFallbackDirective {
  private readonly el = inject(ElementRef<HTMLImageElement>);
  /** Optional short label shown under the placeholder icon, e.g. "Villa photo". */
  readonly nhImgFallback = input<string>('');
  private swapped = false;

  @HostListener('error')
  onError(): void {
    if (this.swapped) return;
    this.swapped = true;
    const img = this.el.nativeElement;
    const label = this.nhImgFallback() || 'Image unavailable';
    img.setAttribute('data-fallback', 'true');
    img.alt = label;
    img.src =
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
          <rect width="400" height="300" fill="#eef1f0"/>
          <g fill="none" stroke="#9fb2ab" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M40 40 L360 40 L360 260 L40 260 Z"/>
            <circle cx="120" cy="105" r="22"/>
            <path d="M40 220 L150 150 L210 200 L280 130 L360 200"/>
          </g>
        </svg>
      `);
  }
}
