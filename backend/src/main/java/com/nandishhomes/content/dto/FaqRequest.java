package com.nandishhomes.content.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FaqRequest(
        @NotBlank @Size(max = 500) String question,
        @NotBlank @Size(max = 2000) String answer,
        @Size(max = 60) String category,
        int sortOrder,
        boolean active) {}
