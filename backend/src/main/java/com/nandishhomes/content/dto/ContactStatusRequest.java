package com.nandishhomes.content.dto;

import jakarta.validation.constraints.Pattern;

public record ContactStatusRequest(@Pattern(regexp = "NEW|READ|IN_PROGRESS|RESOLVED") String status) {}
