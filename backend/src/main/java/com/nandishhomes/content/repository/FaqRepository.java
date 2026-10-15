package com.nandishhomes.content.repository;
import com.nandishhomes.content.entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface FaqRepository extends JpaRepository<Faq, Long> {
    List<Faq> findByActiveTrueOrderBySortOrderAsc();
}