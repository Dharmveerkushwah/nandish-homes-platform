package com.nandishhomes.messaging.service;

import com.nandishhomes.messaging.entity.WhatsAppLog;
import com.nandishhomes.messaging.repository.WhatsAppLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Gap doc item 24: WhatsApp send-attempt logging. No WhatsApp Business API
 * provider is configured in this project, so every attempt is recorded
 * PENDING with an explanatory error message - this deliberately never fakes
 * a "SENT"/delivered status. Once a real provider is wired in, the
 * provider-integration code should call {@link #markSent(Long)} /
 * {@link #markFailed(Long, String)} after the real send attempt.
 */
@Service
public class WhatsAppLogService {
    private final WhatsAppLogRepository repository;
    public WhatsAppLogService(WhatsAppLogRepository repository) { this.repository = repository; }

    @Transactional
    public WhatsAppLog record(String phone, String messageText, String messageType, String bookingReference) {
        WhatsAppLog log = new WhatsAppLog();
        log.setPhone(phone);
        log.setMessageText(messageText);
        log.setMessageType(messageType);
        log.setBookingReference(bookingReference);
        log.setStatus("PENDING");
        log.setErrorMessage("No WhatsApp provider configured - queued only, not actually sent.");
        return repository.save(log);
    }

    @Transactional
    public void markSent(Long id) {
        repository.findById(id).ifPresent(log -> { log.setStatus("SENT"); log.setErrorMessage(null); repository.save(log); });
    }

    @Transactional
    public void markFailed(Long id, String errorMessage) {
        repository.findById(id).ifPresent(log -> { log.setStatus("FAILED"); log.setErrorMessage(errorMessage); repository.save(log); });
    }

    @Transactional(readOnly = true)
    public List<WhatsAppLog> recent() {
        return repository.findTop200ByOrderByCreatedAtDesc();
    }
}
