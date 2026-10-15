package com.nandishhomes.guest.repository;

import com.nandishhomes.guest.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestRepository extends JpaRepository<Guest, Long> {}