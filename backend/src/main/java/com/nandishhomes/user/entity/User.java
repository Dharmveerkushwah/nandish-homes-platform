package com.nandishhomes.user.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "NH_USERS")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_user_seq")
    @SequenceGenerator(name = "nh_user_seq", sequenceName = "NH_USER_SEQ", allocationSize = 1)
    @Column(name = "USER_ID")
    private Long id;
    @Column(name = "EMAIL", nullable = false, unique = true, length = 180)
    private String email;
    @Column(name = "PASSWORD_HASH", nullable = false, length = 255)
    private String passwordHash;
    @Column(name = "DISPLAY_NAME", nullable = false, length = 120)
    private String displayName;
    @Column(name = "IS_ACTIVE", nullable = false)
    private Boolean active = true;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "NH_USER_ROLES", joinColumns = @JoinColumn(name = "USER_ID"))
    @Column(name = "ROLE_NAME")
    private Set<String> roles = new HashSet<>();
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getDisplayName() { return displayName; }
    public Boolean getActive() { return active; }
    public Set<String> getRoles() { return roles; }
    public void setId(Long id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setActive(Boolean active) { this.active = active; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
}