package com.nandishhomes.content.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "NH_FAQ")
public class Faq {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_faq_seq")
    @SequenceGenerator(name = "nh_faq_seq", sequenceName = "NH_FAQ_SEQ", allocationSize = 1)
    @Column(name = "FAQ_ID") private Long id;
    @Column(name = "QUESTION", nullable = false, length = 500) private String question;
    @Column(name = "ANSWER", nullable = false, length = 2000) private String answer;
    @Column(name = "CATEGORY", length = 60) private String category;
    @Column(name = "SORT_ORDER", nullable = false) private Integer sortOrder = 0;
    @Column(name = "IS_ACTIVE", nullable = false) private Boolean active = true;

    public Long getId() { return id; }
    public String getQuestion() { return question; }
    public String getAnswer() { return answer; }
    public String getCategory() { return category; }
    public Integer getSortOrder() { return sortOrder; }
    public Boolean getActive() { return active; }
    public void setQuestion(String question) { this.question = question; }
    public void setAnswer(String answer) { this.answer = answer; }
    public void setCategory(String category) { this.category = category; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public void setActive(Boolean active) { this.active = active; }
}
