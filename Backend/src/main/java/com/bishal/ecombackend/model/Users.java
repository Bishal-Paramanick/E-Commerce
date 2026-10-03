package com.bishal.ecombackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String role = "ROLE_USER";

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "account_non_locked", nullable = false)
    private boolean accountNonLocked = true;

    @Column(name = "account_non_expired", nullable = false)
    private boolean accountNonExpired = true;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt = LocalDateTime.now();

    public Users() {}

    public Users(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    public Users(String username, String email, String password, String role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public Users(String username, String password, String role, boolean enabled, boolean accountNonLocked, boolean accountNonExpired) {
        this.username = username;
        this.password = password;
        this.role = role;
        this.enabled = enabled;
        this.accountNonLocked = accountNonLocked;
        this.accountNonExpired = accountNonExpired;
        this.passwordChangedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "Users{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                ", enabled=" + enabled +
                ", accountNonLocked=" + accountNonLocked +
                ", accountNonExpired=" + accountNonExpired +
                '}';
    }
}