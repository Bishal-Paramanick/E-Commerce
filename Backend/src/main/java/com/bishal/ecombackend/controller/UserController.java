package com.bishal.ecombackend.controller;

import com.bishal.ecombackend.dto.AuthResponse;
import com.bishal.ecombackend.dto.UserLoginRequest;
import com.bishal.ecombackend.dto.UserRegisterRequest;
import com.bishal.ecombackend.dto.UserResponse;
import com.bishal.ecombackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @Autowired
    private UserService service;

    @PostMapping("/register")
    public UserResponse register(@RequestBody UserRegisterRequest request) {
        return service.register(request);
    }

    // Changed return type from String to AuthResponse
    @PostMapping("/login")
    public AuthResponse login(@RequestBody UserLoginRequest request) {
        return service.verify(request);
    }
}