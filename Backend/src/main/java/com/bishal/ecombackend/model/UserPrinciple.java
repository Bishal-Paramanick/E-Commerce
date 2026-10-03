package com.bishal.ecombackend.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

public record UserPrinciple(Users user) implements UserDetails {

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String role = user.getRole();
        if (role == null || role.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String cleanRole = role.replaceFirst("^ROLE_", "").toUpperCase();

        return List.of(
                new SimpleGrantedAuthority("ROLE_" + cleanRole),
                new SimpleGrantedAuthority(cleanRole)
        );
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return user.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        if (user.getPasswordChangedAt() == null) {
            return true;
        }
        return user.getPasswordChangedAt().isAfter(LocalDateTime.now().minusDays(90));
    }

    @Override
    public boolean isEnabled() {
        return user.isEnabled();
    }
}