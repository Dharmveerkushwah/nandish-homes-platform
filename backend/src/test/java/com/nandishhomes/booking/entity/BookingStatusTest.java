package com.nandishhomes.booking.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BookingStatusTest {

    @Test
    void allowsOnlyLegalLifecycleTransitions() {
        assertTrue(BookingStatus.PENDING_PAYMENT.canTransitionTo(BookingStatus.CONFIRMED));
        assertTrue(BookingStatus.PENDING_PAYMENT.canTransitionTo(BookingStatus.CANCELLED));
        assertTrue(BookingStatus.CONFIRMED.canTransitionTo(BookingStatus.CHECKED_IN));
        assertTrue(BookingStatus.CHECKED_IN.canTransitionTo(BookingStatus.CHECKED_OUT));

        assertFalse(BookingStatus.PENDING_PAYMENT.canTransitionTo(BookingStatus.CHECKED_IN));
        assertFalse(BookingStatus.CHECKED_OUT.canTransitionTo(BookingStatus.CONFIRMED));
        assertFalse(BookingStatus.CANCELLED.canTransitionTo(BookingStatus.CONFIRMED));
    }

    @Test
    void parsesExternalValuesWithoutChangingStoredNames() {
        assertTrue(BookingStatus.parse(" confirmed ").isPresent());
        assertEquals(BookingStatus.CONFIRMED, BookingStatus.parse("CONFIRMED").orElseThrow());
        assertTrue(BookingStatus.parse(null).isEmpty());
        assertTrue(BookingStatus.parse("unknown").isEmpty());
    }
}