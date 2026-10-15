import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ABOUT_CONTENT } from '../../core/content/site-content';
import { IconComponent } from '../../shared/icon/icon.component';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
  selector: 'nh-about',
  standalone: true,
  imports: [RouterLink, IconComponent, ImgFallbackDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
// UI gap-fix decision (Phase 43 static-data audit): the backend's ContentBlock entity
// only carries a single title+body pair per contentKey (content/entity/ContentBlock.java),
// with no structured schema for this page's story paragraphs, amenity list, location
// block or image set, and no admin screen writes those fields today. Phase 43's explicit
// audit list (reviews/gallery/places/room counts/booking numbers/revenue/occupancy/
// notifications/room info/FAQ/offers) does not include this page's marketing copy, so it
// is kept static here rather than inventing a JSON-encoding-in-body convention the backend
// was never designed for - that would be new architecture, not a gap fix.
export class AboutComponent {
  readonly content = ABOUT_CONTENT;
}
