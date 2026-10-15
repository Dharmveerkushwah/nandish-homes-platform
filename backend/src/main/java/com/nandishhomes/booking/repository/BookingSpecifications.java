package com.nandishhomes.booking.repository;

import com.nandishhomes.booking.entity.Booking;
import com.nandishhomes.booking.entity.BookingGuest;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Dynamic filters for the admin booking search (gap doc item 3). Each
 * method returns null when its filter is not supplied so Specification's
 * null-safe and()/where() combine only the filters actually present.
 */
public final class BookingSpecifications {
    private BookingSpecifications() {}

    public static Specification<Booking> statusEquals(String status) {
        return (root, query, cb) -> (status == null || status.isBlank()) ? null : cb.equal(root.get("status"), status.toUpperCase());
    }

    public static Specification<Booking> roomIdEquals(Long roomId) {
        return (root, query, cb) -> roomId == null ? null : cb.equal(root.get("room").get("id"), roomId);
    }

    public static Specification<Booking> roomTypeIdEquals(Long roomTypeId) {
        return (root, query, cb) -> roomTypeId == null ? null : cb.equal(root.get("room").get("roomType").get("id"), roomTypeId);
    }

    public static Specification<Booking> checkInFrom(LocalDate from) {
        return (root, query, cb) -> from == null ? null : cb.greaterThanOrEqualTo(root.get("checkIn"), from);
    }

    public static Specification<Booking> checkOutTo(LocalDate to) {
        return (root, query, cb) -> to == null ? null : cb.lessThanOrEqualTo(root.get("checkOut"), to);
    }

    public static Specification<Booking> checkInTo(LocalDate to) {
        return (root, query, cb) -> to == null ? null : cb.lessThanOrEqualTo(root.get("checkIn"), to);
    }

    public static Specification<Booking> updatedBetween(OffsetDateTime from, OffsetDateTime to) {
        return (root, query, cb) -> (from == null || to == null) ? null
                : cb.between(root.get("updatedAt"), from, to);
    }

    public static Specification<Booking> statusNotIn(java.util.Collection<String> statuses) {
        return (root, query, cb) -> (statuses == null || statuses.isEmpty()) ? null : cb.not(root.get("status").in(statuses));
    }

    /** Matches booking reference, guest name or guest phone (case-insensitive for text fields). */
    public static Specification<Booking> search(String term) {
        return (root, query, cb) -> {
            if (term == null || term.isBlank()) return null;
            query.distinct(true);
            Join<Booking, BookingGuest> bg = root.join("bookingGuests", JoinType.LEFT);
            String like = "%" + term.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("reference")), like),
                    cb.like(cb.lower(bg.get("guest").get("fullName")), like),
                    cb.like(bg.get("guest").get("phone"), "%" + term.trim() + "%")
            );
        };
    }
}
