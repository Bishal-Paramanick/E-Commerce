package com.bishal.ecombackend.dto;

public class UserRegisterRequest {
    private String username;
    private String password;
    private String email;
    private String role;

    public UserRegisterRequest() {}

    public UserRegisterRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public UserRegisterRequest(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    public UserRegisterRequest(String username, String password, String email, String role) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}