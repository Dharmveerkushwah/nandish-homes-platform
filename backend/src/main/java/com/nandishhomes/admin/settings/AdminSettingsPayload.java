package com.nandishhomes.admin.settings;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Property and booking settings managed by the admin UI. */
public record AdminSettingsPayload(
        @NotBlank @Size(max = 160) String propertyName,
        @NotBlank @Size(max = 500) String address,
        @NotBlank @Size(max = 30) String phone,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Pattern(regexp = "^(?:[01]\\d|2[0-3]):[0-5]\\d$") String checkInTime,
        @NotBlank @Pattern(regexp = "^(?:[01]\\d|2[0-3]):[0-5]\\d$") String checkOutTime,
        @NotBlank @Size(max = 2000) String cancellationPolicy,
        @Min(1) @Max(50) int guestLimitPerRoom,
        @Size(max = 300) String paymentGatewayNote,
        boolean notifyEmail,
        boolean notifyWhatsapp,
        boolean notifyOnNewBooking) {

    public static AdminSettingsPayload defaults() {
        return new AdminSettingsPayload(
                "Nandish Homes",
                "Nandish Homes, Pattanur, Near Pondicherry, Tamil Nadu, India",
                "+91 98629 86851",
                "bookings@nandishhomes.com",
                "14:00",
                "11:00",
                "Free cancellation up to 48 hours before check-in.",
                4,
                "Not configured yet.",
                true,
                true,
                true);
    }
}