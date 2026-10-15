package com.nandishhomes.messaging.service;

import com.nandishhomes.messaging.entity.EmailLog;
import com.nandishhomes.messaging.repository.EmailLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Gap doc item 23: email send-attempt logging. No mail provider (SMTP/SES/etc.)
 * is configured in this project, so every attempt is recorded PENDING with an
 * explanatory error message - this never fakes a "SENT" status. Once a real
 * provider is wired in, the provider-integration code should call
 * {@link #markSent(Long)} / {@link #markFailed(Long, String)} after the real
 * send attempt instead of leaving entries PENDING.
 */
@Service
public class EmailLogService {
    private final EmailLogRepository repository;
    public EmailLogService(EmailLogRepository repository) { this.repository = repository; }

    @Transactional
    public EmailLog record(String recipient, String subject, String emailType) {
        EmailLog log = new EmailLog();
        log.setRecipient(recipient);
        log.setSubject(subject);
        log.setEmailType(emailType);
        log.setStatus("PENDING");
        log.setErrorMessage("No email provider configured - queued only, not actually sent.");
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
    public List<EmailLog> recent() {
        return repository.findTop200ByOrderByCreatedAtDesc();
    }
}
