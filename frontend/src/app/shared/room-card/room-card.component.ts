import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Room } from '../../core/models/booking.models';
import { IconComponent } from '../icon/icon.component';
import { ImgFallbackDirective } from '../directives/img-fallback.directive';

@Component({
  selector: 'nh-room-card',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, IconComponent, ImgFallbackDirective],
  templateUrl: './room-card.component.html',
  styleUrl: './room-card.component.css',
})
export class RoomCardComponent {
  readonly room = input.required<Room>();
  readonly select = output<Room>();
}
