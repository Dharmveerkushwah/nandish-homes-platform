import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CONTACT_INFO } from '../../core/content/site-content';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'nh-footer',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly year = new Date().getFullYear();
  readonly contact = CONTACT_INFO;
  readonly mapEmbedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(CONTACT_INFO.mapEmbedSrc);
}
