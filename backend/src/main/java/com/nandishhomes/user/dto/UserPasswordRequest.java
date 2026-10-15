package com.nandishhomes.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Admin-set password reset (UI gap-fix: the admin UI's "reset password"
 * action had no matching endpoint). SUPER_ADMIN only, same as the rest of
 * user management - never echoes the password back.
 */
public record UserPasswordRequest(@NotBlank @Size(min = 8, max = 100) String newPassword) {}
