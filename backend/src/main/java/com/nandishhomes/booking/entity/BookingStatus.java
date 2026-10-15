package com.nandishhomes.booking.entity;

import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

/**
 * Booking lifecycle states and their legal transitions.
 *
 * <p>The database and HTTP contract still use the enum names, so introducing
 * this type does not change persisted values or response JSON.</p>
 */
public enum BookingStatus {
    PENDING_PAYMENT,
    CONFIRMED,
    CHECKED_IN,
    CHECKED_OUT,
    CANCELLED,
    EXPIRED;

    public static Optional<BookingStatus> parse(String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return Arrays.stream(values())
                .filter(status -> status.name().equals(normalized))
                .findFirst();
    }

    public Set<BookingStatus> allowedTransitions() {
        return switch (this) {
            case PENDING_PAYMENT -> Set.of(CONFIRMED, CANCELLED, EXPIRED);
            case CONFIRMED -> Set.of(CHECKED_IN, CANCELLED);
            case CHECKED_IN -> Set.of(CHECKED_OUT);
            case CHECKED_OUT, CANCELLED, EXPIRED -> Set.of();
        };
    }

    public boolean canTransitionTo(BookingStatus target) {
        return target != null && allowedTransitions().contains(target);
    }

    public boolean isGuestFacing() {
        return switch (this) {
            case CONFIRMED, CANCELLED, CHECKED_IN, CHECKED_OUT -> true;
            case PENDING_PAYMENT, EXPIRED -> false;
        };
    }
}