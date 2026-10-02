package com.bishal.ecombackend.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrinciple implements UserDetails {

    private final Users user;

    public UserPrinciple(Users user) {
        this.user = user;
    }

    @Override
    public Collection getAuthorities() {
        String role = user.getRole();
        if (role == null || role.trim().isEmpty()) {
            return Collections.emptyList();
        }

        // Spring Security's hasRole("ADMIN") requires authority "ROLE_ADMIN"
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        return Collections.singletonList(new SimpleGrantedAuthority(role));
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
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}