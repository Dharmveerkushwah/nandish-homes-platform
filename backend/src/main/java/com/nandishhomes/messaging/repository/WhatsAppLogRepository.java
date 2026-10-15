package com.nandishhomes.messaging.repository;

import com.nandishhomes.messaging.entity.WhatsAppLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WhatsAppLogRepository extends JpaRepository<WhatsAppLog, Long> {
    List<WhatsAppLog> findTop200ByOrderByCreatedAtDesc();
}
