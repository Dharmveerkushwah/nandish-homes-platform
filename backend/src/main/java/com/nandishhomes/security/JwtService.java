package com.nandishhomes.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Set;
import java.util.List;

@Service
public class JwtService {
    private final SecretKey signingKey;
    private final long tokenMinutes;

    public JwtService(@Value("${nandish.security.jwt-secret}") String secret,
                      @Value("${nandish.security.access-token-minutes}") long tokenMinutes) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET must be configured with at least 32 characters");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.tokenMinutes = tokenMinutes;
    }

    public String issue(String subject, Set<String> roles) {
        Instant now = Instant.now();
        return Jwts.builder().subject(subject).claim("roles", roles)
                .issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(tokenMinutes * 60)))
                .signWith(signingKey).compact();
    }

    public String subject(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public List<String> roles(String token) {
        Object value = Jwts.parser().verifyWith(signingKey).build()
                .parseSignedClaims(token).getPayload().get("roles");
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return List.of();
    }
}