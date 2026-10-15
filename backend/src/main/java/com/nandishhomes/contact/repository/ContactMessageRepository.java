package com.nandishhomes.contact.repository;
import com.nandishhomes.contact.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {}