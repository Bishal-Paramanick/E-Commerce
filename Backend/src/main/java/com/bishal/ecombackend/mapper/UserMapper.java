package com.bishal.ecombackend.mapper;

import com.bishal.ecombackend.dto.UserRegisterRequest;
import com.bishal.ecombackend.dto.UserResponse;
import com.bishal.ecombackend.model.Users;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public Users toEntity(UserRegisterRequest request) {
        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user.setEmail(request.getEmail().trim());
        }
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            user.setRole(request.getRole().trim());
        } else {
            user.setRole("ROLE_USER");
        }
        return user;
    }

    public UserResponse toResponse(Users user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole()
        );
    }
}