package com.nandishhomes.content.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 180) String email,
        @Size(max = 30) String phone,
        @NotBlank @Size(max = 2000) String message
) {}