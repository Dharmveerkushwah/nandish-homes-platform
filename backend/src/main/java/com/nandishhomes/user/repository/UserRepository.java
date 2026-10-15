package com.nandishhomes.user.repository;

import com.nandishhomes.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCaseAndActiveTrue(String email);
}