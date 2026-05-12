package com.retromatch.backendspring.dto;

public class AuthResponse {

    private final String mensaje;
    private final String token;
    private final String rol;
    private final String email;

    public AuthResponse(String mensaje, String token, String rol, String email) {
        this.mensaje = mensaje;
        this.token = token;
        this.rol = rol;
        this.email = email;
    }

    public String getMensaje() {
        return mensaje;
    }

    public String getToken() {
        return token;
    }

    public String getRol() {
        return rol;
    }

    public String getEmail() {
        return email;
    }
}
