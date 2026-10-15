package com.nandishhomes.user.service;

import com.nandishhomes.audit.AuditLogService;
import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.user.dto.UserCreateRequest;
import com.nandishhomes.user.dto.UserResponse;
import com.nandishhomes.user.dto.UserUpdateRequest;
import com.nandishhomes.user.entity.User;
import com.nandishhomes.user.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Gap doc item 20: user & role management. Passwords are always hashed; the
 * hash is never returned. Gap doc item 25: user/role changes are audited.
 */
@Service
public class AdminUserService {
    private static final Set<String> VALID_ROLES =
            Set.of("SUPER_ADMIN", "ADMIN", "MANAGER", "RECEPTIONIST", "CONTENT_MANAGER");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public AdminUserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                            AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> list() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    @Transactional
    public UserResponse create(UserCreateRequest request) {
        Set<String> roles = normalizeRoles(request.roles());
        User user = new User();
        user.setEmail(request.email().toLowerCase());
        user.setDisplayName(request.displayName());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRoles(roles);
        user.setActive(request.active());
        User saved;
        try {
            saved = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(HttpStatus.CONFLICT, "A user with this email already exists");
        }
        auditLogService.record("USER_CREATED", "User", saved.getId(), "Created user " + saved.getEmail() + " with roles " + roles);
        return UserResponse.from(saved);
    }

    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = get(id);
        user.setDisplayName(request.displayName());
        UserResponse response = UserResponse.from(userRepository.save(user));
        auditLogService.record("USER_UPDATED", "User", id, "Updated user " + user.getEmail());
        return response;
    }

    @Transactional
    public UserResponse setStatus(Long id, boolean active) {
        User user = get(id);
        if (!active && isLastActiveSuperAdmin(user)) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot deactivate the last active SUPER_ADMIN account");
        }
        user.setActive(active);
        UserResponse response = UserResponse.from(userRepository.save(user));
        auditLogService.record(active ? "USER_ACTIVATED" : "USER_DEACTIVATED", "User", id, "User " + user.getEmail());
        return response;
    }

    /** UI gap-fix: the admin "reset password" action had no backend endpoint at all. */
    @Transactional
    public UserResponse setPassword(Long id, String newPassword) {
        User user = get(id);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        UserResponse response = UserResponse.from(userRepository.save(user));
        auditLogService.record("USER_PASSWORD_RESET", "User", id, "Password reset for user " + user.getEmail());
        return response;
    }

    @Transactional
    public UserResponse setRoles(Long id, Set<String> roles) {
        User user = get(id);
        Set<String> normalized = normalizeRoles(roles);
        if (!normalized.contains("SUPER_ADMIN") && isLastActiveSuperAdmin(user)) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot remove SUPER_ADMIN from the last active SUPER_ADMIN account");
        }
        user.setRoles(normalized);
        UserResponse response = UserResponse.from(userRepository.save(user));
        auditLogService.record("USER_ROLES_CHANGED", "User", id, "User " + user.getEmail() + " roles -> " + normalized);
        return response;
    }

    private Set<String> normalizeRoles(Set<String> roles) {
        Set<String> normalized = roles.stream().map(String::toUpperCase).collect(Collectors.toCollection(LinkedHashSet::new));
        for (String role : normalized) {
            if (!VALID_ROLES.contains(role)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown role: " + role);
            }
        }
        if (normalized.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least one role is required");
        }
        return normalized;
    }

    private boolean isLastActiveSuperAdmin(User user) {
        if (!Boolean.TRUE.equals(user.getActive()) || !user.getRoles().contains("SUPER_ADMIN")) return false;
        long activeSuperAdmins = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getActive()) && u.getRoles().contains("SUPER_ADMIN"))
                .count();
        return activeSuperAdmins <= 1;
    }

    private User get(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
