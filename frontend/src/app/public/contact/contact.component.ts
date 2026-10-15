import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { CONTACT_INFO } from '../../core/content/site-content';
import { IconComponent } from '../../shared/icon/icon.component';

type FormState = 'idle' | 'sending' | 'sent' | 'unavailable';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'nh-contact',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  private readonly api = inject(ApiService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly contact = CONTACT_INFO;
  readonly mapEmbedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(CONTACT_INFO.mapEmbedSrc);

  form = { name: '', email: '', phone: '', message: '' };
  readonly errors = signal<{ name?: string; email?: string; message?: string }>({});
  readonly state = signal<FormState>('idle');

  submit(): void {
    const errors: { name?: string; email?: string; message?: string } = {};
    if (!this.form.name.trim()) errors.name = 'Please share your name.';
    if (!this.form.email.trim()) errors.email = 'An email helps us reply.';
    else if (!EMAIL_PATTERN.test(this.form.email.trim())) errors.email = 'That email address doesn’t look right.';
    if (!this.form.message.trim()) errors.message = 'Let us know what you’d like to ask.';
    this.errors.set(errors);
    if (Object.keys(errors).length) return;

    this.state.set('sending');
    this.api.submitContactMessage(this.form).subscribe({
      next: () => this.state.set('sent'),
      // POST /api/public/contact is a real, working endpoint (PublicContentController#contact).
      // This still fails gracefully on a network/server error and points the guest at
      // email/WhatsApp instead of an error wall, without clearing what they typed.
      error: () => this.state.set('unavailable'),
    });
  }
}
