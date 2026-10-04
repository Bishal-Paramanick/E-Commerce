package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.service.DatabaseResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/system")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminSystemController {

    private final DatabaseResetService databaseResetService;

    @PostMapping("/reset")
    public ResponseEntity<?> resetSystem(
            @RequestHeader(value = "X-Admin-Reset-Key", required = false) String resetKey,
            Authentication authentication
    ) {
        boolean isKeyValid = "your_secure_key".equals(resetKey) || "ecom-admin-reset-secret".equals(resetKey);
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));

        if (!isKeyValid && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "status", "ERROR",
                    "message", "Access denied. Valid X-Admin-Reset-Key header or ROLE_ADMIN authentication required."
            ));
        }

        databaseResetService.performSystemReset();

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "System state successfully reset. Preserved users: 'bishal', 'admin'. All carts, orders, and custom addresses cleared."
        ));
    }
}
