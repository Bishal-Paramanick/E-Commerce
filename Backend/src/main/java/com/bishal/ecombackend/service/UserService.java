package com.bishal.ecombackend.service;

import com.bishal.ecombackend.dto.AuthResponse;
import com.bishal.ecombackend.dto.UserLoginRequest;
import com.bishal.ecombackend.dto.UserRegisterRequest;
import com.bishal.ecombackend.dto.UserResponse;
import com.bishal.ecombackend.mapper.UserMapper;
import com.bishal.ecombackend.model.Users;
import com.bishal.ecombackend.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepo repo;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private UserMapper mapper;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTService jwtService;

    public UserResponse register(UserRegisterRequest request) {
        Users user = mapper.toEntity(request);
        user.setPassword(encoder.encode(user.getPassword()));
        Users savedUser = repo.save(user);
        return mapper.toResponse(savedUser);
    }

    // Replaced old verify method with this:
    public AuthResponse verify(UserLoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        if (authentication.isAuthenticated()) {
            String token = jwtService.generateToken(request.getUsername());
            Users user = repo.findByUsername(request.getUsername());
            return new AuthResponse(token, user.getUsername(), user.getRole());
        }

        throw new BadCredentialsException("Invalid username or password");
    }
}