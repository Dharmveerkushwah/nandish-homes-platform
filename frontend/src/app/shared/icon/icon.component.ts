import { Component, input } from '@angular/core';

/**
 * Small inline-SVG icon set used across the site in place of the old unicode
 * glyphs (⌂ ♒ ▱ ♧ etc.). Add a new <path>/<circle> case here rather than
 * pulling in an icon-font dependency.
 */
export type IconName =
  | 'villa' | 'pool' | 'bed' | 'ruler' | 'users' | 'wifi' | 'parking' | 'kitchen'
  | 'ac' | 'breakfast' | 'garden' | 'shield' | 'calendar' | 'map-pin' | 'phone'
  | 'mail' | 'whatsapp' | 'chevron-left' | 'chevron-right' | 'chevron-down'
  | 'menu' | 'close' | 'check' | 'star' | 'instagram' | 'facebook' | 'youtube'
  | 'search' | 'alert' | 'image-off' | 'directions' | 'clock' | 'sparkle' | 'family'
  | 'dashboard' | 'list' | 'image' | 'document' | 'help' | 'tag' | 'chart' | 'settings'
  | 'bell' | 'logout' | 'edit' | 'trash' | 'plus' | 'eye' | 'filter' | 'lock' | 'grid'
  | 'upload' | 'ban' | 'arrow-up-right' | 'arrow-down-right' | 'more' | 'download'
  | 'refresh' | 'history' | 'building';

@Component({
  selector: 'nh-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="nh-icon"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('villa') {
          <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9h14v-9" /><path d="M9.5 19v-5h5v5" />
        }
        @case ('pool') {
          <path d="M3 17c1.5 1 2.8 1 4.3 0 1.5-1 2.8-1 4.3 0 1.5 1 2.8 1 4.3 0 1.5-1 2.8-1 4.1 0" />
          <path d="M3 12.5c1.5 1 2.8 1 4.3 0 1.5-1 2.8-1 4.3 0 1.5 1 2.8 1 4.3 0 1.5-1 2.8-1 4.1 0" />
          <path d="M7 8.5a2.2 2.2 0 1 0 4.4 0 2.2 2.2 0 0 0-4.4 0Z" />
        }
        @case ('bed') {
          <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" /><path d="M3 18h18" /><path d="M3 13V7" /><path d="M7.5 10V7.8A1.8 1.8 0 0 1 9.3 6h1.9a1.8 1.8 0 0 1 1.8 1.8V10" />
        }
        @case ('ruler') {
          <rect x="3" y="8" width="18" height="8" rx="1.4" /><path d="M7 8v3M11 8v3M15 8v3M19 8v3" />
        }
        @case ('users') {
          <circle cx="9" cy="8" r="3" /><path d="M2.7 19.4a6.3 6.3 0 0 1 12.6 0" /><path d="M16.3 6.2a3 3 0 0 1 0 5.8" /><path d="M18.8 13.6a6.3 6.3 0 0 1 3.5 5.6" />
        }
        @case ('family') {
          <circle cx="7" cy="7" r="2.4" /><circle cx="17" cy="7" r="2.4" /><circle cx="12" cy="8.6" r="1.7" />
          <path d="M2.3 19a5 5 0 0 1 9.4 0" /><path d="M12.3 19a4.3 4.3 0 0 1 8.4 0" />
        }
        @case ('wifi') {
          <path d="M3.5 8.5a13 13 0 0 1 17 0" /><path d="M6.5 12a9 9 0 0 1 11 0" /><path d="M9.5 15.5a5 5 0 0 1 5 0" /><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
        }
        @case ('parking') {
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M9.5 16.5v-9H13a3 3 0 1 1 0 6H9.5" />
        }
        @case ('kitchen') {
          <path d="M6 3v6M9 3v6M6 6h3" /><path d="M6 9v12" /><rect x="13" y="3" width="7" height="18" rx="1.4" /><path d="M13 13h7" />
        }
        @case ('ac') {
          <rect x="2.5" y="6" width="19" height="6" rx="1.6" /><path d="M6 15.5 5 19M10.5 15.5v3.7M15 15.5l1 3.7M19 15.5l1.3 3.2" />
        }
        @case ('breakfast') {
          <path d="M4 8h13v4a6.5 6.5 0 0 1-13 0Z" /><path d="M17 9.5h1.8a2.3 2.3 0 0 1 0 4.6H17" /><path d="M3 20h15" />
        }
        @case ('garden') {
          <path d="M12 21v-8" /><path d="M12 13c0-3.6-2.7-6.4-6.3-6.4C6 10.1 8.7 13 12 13Z" /><path d="M12 13c0-3.9 2.9-7 6.6-7C18.6 10.2 15.6 13 12 13Z" />
        }
        @case ('shield') {
          <path d="M12 3.2 4.5 6v6c0 4.6 3.1 8 7.5 9 4.4-1 7.5-4.4 7.5-9V6Z" /><path d="m9 12 2 2 4-4.2" />
        }
        @case ('calendar') {
          <rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M3.5 10h17" /><path d="M8 3v4M16 3v4" />
        }
        @case ('map-pin') {
          <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.4" />
        }
        @case ('directions') {
          <path d="m3 11 9-8 9 8" /><path d="M5 10.5V20h14v-9.5" /><path d="M9.5 20v-5.5h5V20" />
        }
        @case ('phone') {
          <path d="M6.5 3.5 9 6 7.2 9a11 11 0 0 0 7.8 7.8L18 15l2.5 2.5v2.7a1.8 1.8 0 0 1-2 1.8A16.5 16.5 0 0 1 3.7 6.5a1.8 1.8 0 0 1 1.8-2Z" />
        }
        @case ('mail') {
          <rect x="2.7" y="5" width="18.6" height="14" rx="2" /><path d="m3.5 6 8.5 7 8.5-7" />
        }
        @case ('whatsapp') {
          <path d="M12 3.3a8.7 8.7 0 0 0-7.4 13.2L3.3 20.7l4.3-1.3A8.7 8.7 0 1 0 12 3.3Z" />
          <path d="M8.7 8.4c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .6.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.3-.1.5.5 1 1.5 2 2.6 2.5.2.1.3.1.5-.1l.6-.6c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.2.4.5 0 .8-.9 1.5-1.6 1.6-1.3.2-3.2-.4-5-2.1-1.4-1.4-2.1-2.7-2.3-3.7-.1-.7 0-1.4.3-1.9Z" fill="currentColor" stroke="none" />
        }
        @case ('chevron-left') { <path d="M15 5 8 12l7 7" /> }
        @case ('chevron-right') { <path d="m9 5 7 7-7 7" /> }
        @case ('chevron-down') { <path d="m5 8.5 7 7 7-7" /> }
        @case ('menu') { <path d="M4 6.5h16M4 12h16M4 17.5h16" /> }
        @case ('close') { <path d="m5 5 14 14M19 5 5 19" /> }
        @case ('check') { <path d="m4.5 12.5 5 5 10-11" /> }
        @case ('star') { <path d="m12 3.5 2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6-4.5-4.1 6-.7Z" /> }
        @case ('sparkle') { <path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><circle cx="12" cy="12" r="4.2" /> }
        @case ('instagram') {
          <rect x="3.3" y="3.3" width="17.4" height="17.4" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17" cy="7" r=".9" fill="currentColor" stroke="none" />
        }
        @case ('facebook') {
          <path d="M14 21v-7.2h2.4l.4-3H14V8.7c0-.9.2-1.5 1.5-1.5H17V4.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H8.5v3H10.8V21Z" />
        }
        @case ('youtube') {
          <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" /><path d="M10.5 9.3v5.4l4.8-2.7Z" fill="currentColor" stroke="none" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.3-4.3" />
        }
        @case ('alert') {
          <path d="M12 3.5 21.5 20h-19Z" /><path d="M12 9.5v4.2" /><circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none" />
        }
        @case ('image-off') {
          <path d="M3 3l18 18" /><path d="M21 15.5V6a1.6 1.6 0 0 0-1.6-1.6H8.5" /><path d="M3 6.4V18a1.6 1.6 0 0 0 1.6 1.6H19" /><circle cx="8.5" cy="9.5" r="1.7" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />
        }
        @case ('dashboard') {
          <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.3" /><rect x="13" y="3.5" width="7.5" height="4.5" rx="1.3" /><rect x="13" y="10" width="7.5" height="10.5" rx="1.3" /><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.3" />
        }
        @case ('list') {
          <path d="M9 6.5h11.5M9 12h11.5M9 17.5h11.5" /><circle cx="4" cy="6.5" r="1.1" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="4" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
        }
        @case ('image') {
          <rect x="2.7" y="4.5" width="18.6" height="15" rx="2" /><circle cx="8.3" cy="10" r="1.8" /><path d="m4 17.5 5-5 3.5 3.5 3-3L21 17" />
        }
        @case ('document') {
          <path d="M7 3.5h7l4 4v13H7Z" /><path d="M14 3.5v4h4" /><path d="M9.5 12.5h6M9.5 16h6" />
        }
        @case ('help') {
          <circle cx="12" cy="12" r="8.7" /><path d="M9.7 9.3a2.4 2.4 0 0 1 4.6 1c0 1.6-2.3 1.8-2.3 3.4" /><circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none" />
        }
        @case ('tag') {
          <path d="M11.5 3.5H4v7.5L13.8 20.8a1.7 1.7 0 0 0 2.4 0l4.6-4.6a1.7 1.7 0 0 0 0-2.4Z" /><circle cx="8" cy="8" r="1.4" />
        }
        @case ('chart') {
          <path d="M4 20V10M11 20V4M18 20v-7" /><path d="M2.5 20h19" />
        }
        @case ('settings') {
          <circle cx="12" cy="12" r="3.1" /><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6" />
        }
        @case ('bell') {
          <path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.4 5.4 2 6.3H4c.6-.9 2-2.3 2-6.3Z" /><path d="M9.7 19.8a2.3 2.3 0 0 0 4.6 0" />
        }
        @case ('logout') {
          <path d="M9.5 21H5.5a1.8 1.8 0 0 1-1.8-1.8V4.8A1.8 1.8 0 0 1 5.5 3h4" /><path d="M16 16.5 21 12l-5-4.5" /><path d="M21 12H9.5" />
        }
        @case ('edit') {
          <path d="M4 20h4L20.5 7.5a2 2 0 0 0 0-2.8l-.7-.7a2 2 0 0 0-2.8 0L4.5 16.5Z" /><path d="M13.8 6.2 18 10.4" />
        }
        @case ('trash') {
          <path d="M4.5 7h15" /><path d="M9 7V4.8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7" /><path d="M6.5 7 7.4 20a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.5 7" /><path d="M10.2 11v6M13.8 11v6" />
        }
        @case ('plus') {
          <path d="M12 4.5v15M4.5 12h15" />
        }
        @case ('eye') {
          <path d="M2.3 12S5.7 5.3 12 5.3 21.7 12 21.7 12 18.3 18.7 12 18.7 2.3 12 2.3 12Z" /><circle cx="12" cy="12" r="3" />
        }
        @case ('filter') {
          <path d="M3.5 5h17L14 12.7V19l-4 2v-8.3Z" />
        }
        @case ('lock') {
          <rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M7.5 10.5V7.8a4.5 4.5 0 0 1 9 0v2.7" />
        }
        @case ('grid') {
          <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.2" /><rect x="13" y="3.5" width="7.5" height="7.5" rx="1.2" /><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.2" /><rect x="13" y="13" width="7.5" height="7.5" rx="1.2" />
        }
        @case ('upload') {
          <path d="M12 15.5V4.5M7.5 9 12 4.5 16.5 9" /><path d="M4.5 15.5V18a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-2.5" />
        }
        @case ('ban') {
          <circle cx="12" cy="12" r="8.7" /><path d="m6 6 12 12" />
        }
        @case ('arrow-up-right') { <path d="M7 17 17 7M8.5 7H17v8.5" /> }
        @case ('arrow-down-right') { <path d="M7 7 17 17M17 8.5V17H8.5" /> }
        @case ('more') {
          <circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.3" fill="currentColor" stroke="none" />
        }
        @case ('download') {
          <path d="M12 3.5v11M7.5 10l4.5 4.5L16.5 10" /><path d="M4.5 16.5V19A2.5 2.5 0 0 0 7 21.5h10a2.5 2.5 0 0 0 2.5-2.5v-2.5" />
        }
        @case ('refresh') {
          <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5" /><path d="M20 4v4.5h-4.5" /><path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5" /><path d="M4 20v-4.5h4.5" />
        }
        @case ('history') {
          <path d="M4 12a8 8 0 1 0 2.3-5.6" /><path d="M4 4v4.5h4.5" /><path d="M12 8v4.5l3 2" />
        }
        @case ('building') {
          <rect x="4.5" y="3.5" width="10" height="17" rx="1" /><path d="M14.5 9.5H19a1 1 0 0 1 1 1V20.5" /><path d="M7.5 7.5h1M11 7.5h1M7.5 11h1M11 11h1M7.5 14.5h1M11 14.5h1" />
        }
      }
    </svg>
  `,
  styles: [':host{display:inline-flex;line-height:0}'],
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
