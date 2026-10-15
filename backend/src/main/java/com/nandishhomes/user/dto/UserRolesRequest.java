package com.nandishhomes.user.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Set;

public record UserRolesRequest(@NotNull Set<String> roles) {}
