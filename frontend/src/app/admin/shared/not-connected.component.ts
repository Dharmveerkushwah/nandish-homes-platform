import { Component } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';

/**
 * Honest "this isn't wired up yet" banner used wherever the gap doc asks for
 * a feature that has no backend endpoint yet (item 35: "Do not use
 * static/mock data for production functionality"). Content is projected so
 * each call site can name the specific missing endpoint.
 */
@Component({
  selector: 'nh-not-connected',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="not-connected">
      <nh-icon name="alert" [size]="14" />
      <span><ng-content /></span>
    </div>
  `,
})
export class NotConnectedComponent {}
