package com.nandishhomes.user.controller;

import com.nandishhomes.security.Roles;
import com.nandishhomes.user.dto.UserCreateRequest;
import com.nandishhomes.user.dto.UserPasswordRequest;
import com.nandishhomes.user.dto.UserResponse;
import com.nandishhomes.user.dto.UserRolesRequest;
import com.nandishhomes.user.dto.UserStatusRequest;
import com.nandishhomes.user.dto.UserUpdateRequest;
import com.nandishhomes.user.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Gap doc item 20: user & role management - SUPER_ADMIN only (not in the doc's
 * per-role table).
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize(Roles.SUPER_ADMIN_ONLY)
public class AdminUserController {
	private final AdminUserService service;

	public AdminUserController(AdminUserService service) {
		this.service = service;
	}

	@GetMapping
	public List<UserResponse> list() {
		return service.list();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public UserResponse create(@Valid @RequestBody UserCreateRequest request) {
		return service.create(request);
	}

	@PutMapping("/{id}")
	public UserResponse update(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
		return service.update(id, request);
	}

	@PutMapping("/{id}/status")
	public UserResponse setStatus(@PathVariable Long id, @Valid @RequestBody UserStatusRequest request) {
		return service.setStatus(id, request.active());
	}

	@PutMapping("/{id}/roles")
	public UserResponse setRoles(@PathVariable Long id, @Valid @RequestBody UserRolesRequest request) {
		return service.setRoles(id, request.roles());
	}

	/**
	 * UI gap-fix: the admin "reset password" action had no backend endpoint at all.
	 */
	@PutMapping("/{id}/password")
	public UserResponse setPassword(@PathVariable Long id, @Valid @RequestBody UserPasswordRequest request) {
		return service.setPassword(id, request.newPassword());
	}
}
