package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.service.DatabaseResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reset")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ResetController {

    private final DatabaseResetService databaseResetService;

    @PostMapping
    public ResponseEntity<Void> resetDatabase() {
        databaseResetService.resetAndSeedDatabase();
        return ResponseEntity.noContent().build();
    }
}