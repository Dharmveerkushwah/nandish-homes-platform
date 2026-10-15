package com.nandishhomes.user.dto;

import jakarta.validation.constraints.*;
import java.util.Set;

public record UserCreateRequest(
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(max = 120) String displayName,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotNull Set<String> roles,
        boolean active) {}
