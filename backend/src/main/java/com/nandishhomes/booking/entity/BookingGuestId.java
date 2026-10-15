package com.nandishhomes.booking.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class BookingGuestId implements Serializable {
    private Long bookingId;
    private Long guestId;
    public BookingGuestId() {}
    public BookingGuestId(Long bookingId, Long guestId) { this.bookingId = bookingId; this.guestId = guestId; }
    public Long getBookingId() { return bookingId; }
    public Long getGuestId() { return guestId; }
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BookingGuestId that)) return false;
        return java.util.Objects.equals(bookingId, that.bookingId) && java.util.Objects.equals(guestId, that.guestId);
    }
    @Override public int hashCode() { return java.util.Objects.hash(bookingId, guestId); }
}