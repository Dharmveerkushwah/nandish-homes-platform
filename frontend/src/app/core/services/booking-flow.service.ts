import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { BookingRequest, BookingResponse, Room } from '../models/booking.models';
import { PaymentService } from './payment.service';

export interface GuestDetails {
  fullName: string;
  email: string;
  phone: string;
  specialRequest: string;
}

export interface GuestFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[0-9\s-]{7,15}$/;

function isoDate(offset: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Shared booking-modal state so Home, Rooms, and Room Details can all open
 * the same "Make it yours" flow for a given room without duplicating the
 * form, validation, and API-call logic app.component used to own alone.
 */
@Injectable({ providedIn: 'root' })
export class BookingFlowService {
  private readonly api = inject(ApiService);
  /** Razorpay implementation prompt: payment orchestration is a separate service - this only hands off to it. */
  readonly payment = inject(PaymentService);

  readonly selectedRoom = signal<Room | null>(null);
  readonly alternativeRooms = signal<Room[]>([]);
  readonly checkingAlternatives = signal(false);
  readonly checkIn = signal(isoDate(1));
  readonly checkOut = signal(isoDate(3));
  readonly guests = signal(2);
  readonly guest = signal<GuestDetails>({ fullName: '', email: '', phone: '', specialRequest: '' });
  readonly submitting = signal(false);
  readonly bookingError = signal('');
  readonly bookingConfirmation = signal<BookingResponse | null>(null);
  readonly formErrors = signal<GuestFormErrors>({});
  readonly touched = signal<Record<string, boolean>>({});

  readonly nights = computed(() => {
    const inMs = new Date(this.checkIn()).getTime();
    const outMs = new Date(this.checkOut()).getTime();
    return Math.max(1, Math.round((outMs - inMs) / 86_400_000));
  });

  readonly total = computed(() => (this.selectedRoom()?.pricePerNight ?? 0) * this.nights());

  open(room: Room, dates?: { checkIn?: string; checkOut?: string; guests?: number }): void {
    this.alternativeRooms.set([]);
    this.checkingAlternatives.set(false);
    this.selectedRoom.set(room);
    this.bookingConfirmation.set(null);
    this.bookingError.set('');
    this.formErrors.set({});
    this.touched.set({});
    this.guest.set({ fullName: '', email: '', phone: '', specialRequest: '' });
    this.payment.reset();
    if (dates?.checkIn) this.checkIn.set(dates.checkIn);
    if (dates?.checkOut) this.checkOut.set(dates.checkOut);
    if (dates?.guests) this.guests.set(dates.guests);
  }

  close(): void {
    this.selectedRoom.set(null);
    this.bookingConfirmation.set(null);
    this.payment.reset();
  }

  /** "Start New Booking" after a definitive decline/expiry: same room/dates/guest details, a fresh booking + order. */
  startNewBooking(): void {
    this.bookingConfirmation.set(null);
    this.bookingError.set('');
    this.payment.reset();
  }

  markTouched(field: string): void {
    this.touched.update((current) => ({ ...current, [field]: true }));
  }

  validate(): boolean {
    const guest = this.guest();
    const errors: GuestFormErrors = {};
    if (!guest.fullName.trim()) errors.fullName = 'Please tell us your name.';
    if (!guest.email.trim()) errors.email = 'An email is required so we can confirm your stay.';
    else if (!EMAIL_PATTERN.test(guest.email.trim())) errors.email = 'That email address doesn’t look right.';
    if (!guest.phone.trim()) errors.phone = 'A phone number helps us reach you quickly.';
    else if (!PHONE_PATTERN.test(guest.phone.trim())) errors.phone = 'Enter a valid phone number (7–15 digits).';
    this.formErrors.set(errors);
    this.touched.set({ fullName: true, email: true, phone: true });
    return Object.keys(errors).length === 0;
  }

  submit(): void {
  const room = this.selectedRoom();

  if (!room) return;

  if (this.checkOut() <= this.checkIn()) {
    this.bookingError.set('Check-out must be after check-in.');
    return;
  }

  if (!this.validate()) return;

  this.submitting.set(true);
  this.bookingError.set('');

  // Start booking creation before payment.
  this.payment.beginBookingCreation();

  const request: BookingRequest = {
    roomId: room.id,
    checkIn: this.checkIn(),
    checkOut: this.checkOut(),
    guests: this.guests(),
    guest: this.guest(),
  };




  
  this.api.createBooking(request).subscribe({
    next: (booking) => {
      this.bookingConfirmation.set(booking);
      this.submitting.set(false);
      this.payment.startForBooking(booking, this.guest());
    },

    error: (error: {
      error?: { message?: string };
      status?: number;
    }) => {
      const message =
        error.error?.message ??
        'We could not complete the booking. Please try again.';

      this.bookingError.set(
        error.status === 0
          ? 'We could not reach the server. Check your connection and try again.'
          : message
      );

      this.submitting.set(false);
      this.payment.reset();

      // If the selected room is unavailable, find alternatives
      // for the same check-in, check-out and guest count.
      if (
        error.status === 409 ||
        message.toLowerCase().includes('no longer available') ||
        message.toLowerCase().includes('not available')
      ) {
        this.findAlternativeRooms();
      }
    },
  });
}


findAlternativeRooms(): void {
  const selectedRoom = this.selectedRoom();

  if (!selectedRoom) {
    return;
  }

  this.checkingAlternatives.set(true);
  this.alternativeRooms.set([]);

  this.api.getAvailability({
    checkIn: this.checkIn(),
    checkOut: this.checkOut(),
    guests: this.guests(),
  }).subscribe({
    next: (rooms) => {
      this.alternativeRooms.set(
        rooms.filter(
          room =>
            room.id !== selectedRoom.id &&
            room.status === 'ACTIVE'
        )
      );

      this.checkingAlternatives.set(false);
    },
    error: () => {
      this.alternativeRooms.set([]);
      this.checkingAlternatives.set(false);
    },
  });
}
selectRoom(room: Room): void {
  this.selectedRoom.set(room);
  this.bookingError.set('');
  this.alternativeRooms.set([]);
  this.checkingAlternatives.set(false);
}

}
