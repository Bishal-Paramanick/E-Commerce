package com.bishal.ecombackend.model;

import org.jspecify.annotations.NonNull;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

public record UserPrinciple(Users user) implements UserDetails {

    @Override
    public @NonNull Collection<SimpleGrantedAuthority> getAuthorities() {
        String role = user.getRole();
        if (role == null || role.trim().isEmpty()) {
            return Collections.emptyList();
        }

        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        return Collections.singletonList(new SimpleGrantedAuthority(role));
    }

    @Override
    public @NonNull String getPassword() {
        return user.getPassword();
    }

    @Override
    public @NonNull String getUsername() {
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