package com.retromatch.backendspring.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // 1. SI ES PÚBLICO, NO HAGAS NADA Y SAL DE AQUÍ
        if (path.startsWith("/api/auth/") || (path.startsWith("/api/productos") && method.equals("GET"))) {
            filterChain.doFilter(request, response);
            return;
        }

        String authorizationHeader = request.getHeader("Authorization");

        // 2. Validación más estricta
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ") && authorizationHeader.length() > 15) {
            String token = authorizationHeader.substring(7);
            try {
                if (jwtUtil.validarToken(token)) {
                    String email = jwtUtil.extraerEmail(token);
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            email, null, new ArrayList<>());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                SecurityContextHolder.clearContext();
                log.warn("Token JWT invalido para la ruta {}", path);
            }
        }

        filterChain.doFilter(request, response);
    }
}
