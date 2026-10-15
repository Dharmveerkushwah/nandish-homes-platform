package com.nandishhomes.content.dto;

import jakarta.validation.constraints.Size;

public record ContentRequest(@Size(max = 200) String title, String body) {}
