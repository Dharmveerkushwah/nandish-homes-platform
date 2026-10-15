package com.nandishhomes.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AmenityRequest(@NotBlank @Size(max = 100) String name) {}
