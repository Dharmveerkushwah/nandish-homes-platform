import { Component } from '@angular/core';
import { CONTACT_INFO } from '../../core/content/site-content';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'nh-whatsapp-button',
  standalone: true,
  imports: [IconComponent],
  template: `
    <a
      class="whatsapp-fab"
      [href]="'https://wa.me/' + number + '?text=' + prefill"
      target="_blank"
      rel="noopener"
      aria-label="Chat with Nandish Homes on WhatsApp"
    >
      <nh-icon name="whatsapp" [size]="26" />
    </a>
  `,
  styles: [`
    :host{position:fixed;right:18px;bottom:20px;z-index:45}
    .whatsapp-fab{
      display:grid;place-items:center;width:56px;height:56px;border-radius:50%;
      background:#25D366;color:#fff;box-shadow:0 8px 22px rgba(20,60,40,.35);
      animation:nh-wa-pulse 2.6s ease-in-out infinite;transition:transform .15s;
    }
    .whatsapp-fab:hover{transform:scale(1.06)}
    @keyframes nh-wa-pulse{0%,100%{box-shadow:0 8px 22px rgba(20,60,40,.35)}50%{box-shadow:0 8px 22px rgba(20,60,40,.35),0 0 0 8px rgba(37,211,102,.18)}}
    @media(max-width:600px){:host{right:14px;bottom:16px}.whatsapp-fab{width:50px;height:50px}}
  `],
})
export class WhatsappButtonComponent {
  /** Configurable phone number (E.164, no plus/spaces) — see core/content/site-content.ts CONTACT_INFO.whatsappNumber. */
  readonly number = CONTACT_INFO.whatsappNumber;
  readonly prefill = encodeURIComponent('Hi Nandish Homes! I’d like to know more about availability.');
}
