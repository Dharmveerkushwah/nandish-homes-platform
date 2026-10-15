package com.nandishhomes.messaging.repository;

import com.nandishhomes.messaging.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findTop200ByOrderByCreatedAtDesc();
}
