package com.nandishhomes.booking.entity;

import com.nandishhomes.guest.entity.Guest;
import jakarta.persistence.*;

@Entity
@Table(name = "NH_BOOKING_GUESTS")
public class BookingGuest {
    @EmbeddedId
    private BookingGuestId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("bookingId")
    @JoinColumn(name = "BOOKING_ID", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("guestId")
    @JoinColumn(name = "GUEST_ID", nullable = false)
    private Guest guest;

    public BookingGuest() {}
    public BookingGuest(Booking booking, Guest guest) {
        this.booking = booking;
        this.guest = guest;
        this.id = new BookingGuestId(booking.getId(), guest.getId());
    }
    public BookingGuestId getId() { return id; }
    public Booking getBooking() { return booking; }
    public Guest getGuest() { return guest; }
}