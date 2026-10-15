package com.nandishhomes.booking.dto;

import jakarta.validation.constraints.*;

public record GuestRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(max = 30) String phone,
        @Size(max = 500) String specialRequest) {}