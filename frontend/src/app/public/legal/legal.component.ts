import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { IconComponent } from '../../shared/icon/icon.component';

type LegalKey = 'privacy' | 'terms';

const CONTENT: Record<LegalKey, { title: string; intro: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: 'Privacy Policy',
    intro: 'This page explains, in plain language, what information Nandish Homes collects when you enquire or book a stay, and how it is used.',
    sections: [
      { heading: 'What we collect', body: 'When you check availability or submit a booking request, we collect your name, email, phone number, and any message you choose to add, along with your chosen dates and guest count.' },
      { heading: 'How we use it', body: 'Your details are used to confirm availability, process your booking, contact you about your stay, and respond to enquiries. We do not sell guest information to third parties.' },
      { heading: 'Payment information', body: 'Payments are processed by Razorpay. Nandish Homes does not store your card details — they are handled directly by our payment provider under their own security standards.' },
      { heading: 'Your choices', body: 'You can ask us to update or delete your contact details at any time by emailing bookings@nandishhomes.com or messaging us on WhatsApp.' },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    intro: 'A short summary of the terms that apply when you book a stay with Nandish Homes. For anything not covered here, please reach out before booking.',
    sections: [
      { heading: 'Bookings', body: 'A booking is confirmed once availability is verified and any required deposit is received. Booking requests submitted through the site are provisional until confirmed by our team.' },
      { heading: 'Check-in & check-out', body: 'Standard check-in is from 1:00 PM and check-out is by 11:00 AM. Early check-in or late check-out is subject to availability.' },
      { heading: 'Cancellations', body: 'Cancellations made at least 7 days before check-in receive a full refund. Cancellations within 7 days are subject to a partial charge. See our FAQ for details.' },
      { heading: 'Guest conduct', body: 'Guests are responsible for the property during their stay and for any damage caused. Maximum guest counts per room/villa must be respected for safety and comfort.' },
    ],
  },
};

@Component({
  selector: 'nh-legal',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './legal.component.html',
  styleUrl: './legal.component.css',
})
export class LegalComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly key = signal<LegalKey>((this.route.snapshot.data['legalKey'] as LegalKey) ?? 'privacy');

  readonly content = computed(() => CONTENT[this.key()]);

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const data = this.route.snapshot.data['legalKey'] as LegalKey | undefined;
      if (data) this.key.set(data);
    });
  }
}
