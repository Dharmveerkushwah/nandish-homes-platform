package com.nandishhomes.content.repository;
import com.nandishhomes.content.entity.ContentBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ContentRepository extends JpaRepository<ContentBlock, Long> {
    Optional<ContentBlock> findByContentKeyIgnoreCase(String contentKey);
}