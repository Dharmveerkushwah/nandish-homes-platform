import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { WhatsappButtonComponent } from './layout/whatsapp-button/whatsapp-button.component';
import { BookingModalComponent } from './shared/booking-modal/booking-modal.component';

@Component({
  selector: 'nh-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, WhatsappButtonComponent, BookingModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly router = inject(Router);
  readonly isAdminRoute = signal(this.router.url.startsWith('/admin'));

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.isAdminRoute.set((event as NavigationEnd).urlAfterRedirects.startsWith('/admin'));
    });
  }
}
