package com.nandishhomes.user.dto;

import com.nandishhomes.user.entity.User;
import java.util.Set;

/** Gap doc item 20: never returns the password hash. */
public record UserResponse(Long id, String email, String displayName, boolean active, Set<String> roles) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getDisplayName(),
                Boolean.TRUE.equals(user.getActive()), user.getRoles());
    }
}
