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
        user.setRole("ROLE_USER"); // Enforce default role safely
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