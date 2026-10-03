package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.dto.*;
import com.bishal.ecombackend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    // --- Public Authentication Endpoints ---

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody UserLoginRequest request) {
        return ResponseEntity.ok(service.verify(request));
    }

    // --- Authenticated Profile Endpoints ---

    @GetMapping("/api/users/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(service.getProfile(authentication.getName()));
    }

    @PutMapping("/api/users/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(service.updateProfile(authentication.getName(), request));
    }

    // --- Authenticated Saved Address Endpoints ---

    @GetMapping("/api/users/addresses")
    public ResponseEntity<List<AddressResponse>> getAddresses(Authentication authentication) {
        return ResponseEntity.ok(service.getUserAddresses(authentication.getName()));
    }

    @PostMapping("/api/users/addresses")
    public ResponseEntity<AddressResponse> addAddress(
            Authentication authentication,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.addAddress(authentication.getName(), request));
    }

    @PutMapping("/api/users/addresses/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(service.updateAddress(authentication.getName(), id, request));
    }

    @PatchMapping("/api/users/addresses/{id}/default")
    public ResponseEntity<AddressResponse> setDefaultAddress(
            Authentication authentication,
            @PathVariable UUID id) {
        return ResponseEntity.ok(service.setDefaultAddress(authentication.getName(), id));
    }

    @DeleteMapping("/api/users/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(
            Authentication authentication,
            @PathVariable UUID id) {
        service.deleteAddress(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}