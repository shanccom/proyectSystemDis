package com.voting.auth.dto;

public class AuthResponse {

    private Long userId;
    private String token;
    private String email;
    private String role;

    public AuthResponse(Long userId, String token, String email, String role) {
        this.userId = userId;
        this.token = token;
        this.email = email;
        this.role = role;
    }

    public Long getUserId() { return userId; }
    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
}
