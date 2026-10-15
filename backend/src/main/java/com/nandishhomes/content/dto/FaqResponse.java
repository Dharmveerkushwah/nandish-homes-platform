package com.nandishhomes.content.dto;

import com.nandishhomes.content.entity.Faq;

public record FaqResponse(Long id, String question, String answer, String category, int sortOrder, boolean active) {
    public static FaqResponse from(Faq faq) {
        return new FaqResponse(faq.getId(), faq.getQuestion(), faq.getAnswer(), faq.getCategory(),
                faq.getSortOrder(), Boolean.TRUE.equals(faq.getActive()));
    }
}
