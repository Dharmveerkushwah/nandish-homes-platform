package com.nandishhomes.auth.controller;

import com.nandishhomes.auth.dto.LoginRequest;
import com.nandishhomes.auth.dto.LoginResponse;
import com.nandishhomes.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HTTP adapter for authentication. Token creation and credential checks stay
 * in AuthService; the public endpoint contract is unchanged.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}