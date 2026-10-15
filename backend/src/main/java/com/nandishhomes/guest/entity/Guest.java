package com.nandishhomes.guest.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "NH_GUESTS")
public class Guest {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_guest_seq")
    @SequenceGenerator(name = "nh_guest_seq", sequenceName = "NH_GUEST_SEQ", allocationSize = 1)
    @Column(name = "GUEST_ID")
    private Long id;
    @Column(name = "FULL_NAME", nullable = false, length = 120)
    private String fullName;
    @Column(name = "EMAIL", nullable = false, length = 180)
    private String email;
    @Column(name = "PHONE", nullable = false, length = 30)
    private String phone;
    @Column(name = "SPECIAL_REQUEST", length = 500)
    private String specialRequest;
    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getSpecialRequest() { return specialRequest; }
    public void setId(Long id) { this.id = id; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setSpecialRequest(String specialRequest) { this.specialRequest = specialRequest; }
}