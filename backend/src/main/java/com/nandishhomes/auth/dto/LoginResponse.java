package com.nandishhomes.auth.dto;

import java.util.Set;

public record LoginResponse(String accessToken, String tokenType, String displayName, Set<String> roles) {}