package com.retromatch.backendspring.controller;

import com.retromatch.backendspring.dto.AuthResponse;
import com.retromatch.backendspring.dto.LoginRequest;
import com.retromatch.backendspring.dto.MessageResponse;
import com.retromatch.backendspring.dto.RegistroRequest;
import com.retromatch.backendspring.exception.BusinessException;
import com.retromatch.backendspring.model.Usuario;
import com.retromatch.backendspring.repository.UsuarioRepository;
import com.retromatch.backendspring.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
// ✅ CORREGIDO: eliminado @CrossOrigin — el CORS ya lo gestiona SecurityConfig globalmente
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private final String CLAVE_MAESTRA = "RETROMATCH_MASTER_26";

    @PostMapping("/registro")
    public ResponseEntity<MessageResponse> registrarUsuario(@RequestBody RegistroRequest request) {
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BusinessException("El email ya esta registrado.");
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setEmail(request.getEmail());
        nuevoUsuario.setPassword(passwordEncoder.encode(request.getPassword()));

        if (request.getCodigoAdmin() != null && request.getCodigoAdmin().equals(CLAVE_MAESTRA)) {
            nuevoUsuario.setRol("ADMIN");
        } else {
            nuevoUsuario.setRol("USER");
        }

        usuarioRepository.save(nuevoUsuario);
        log.info("Usuario registrado: email={}, rol={}", nuevoUsuario.getEmail(), nuevoUsuario.getRol());
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new MessageResponse("Usuario registrado con exito en RetroMatch como " + nuevoUsuario.getRol() + ".")
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());

        if (usuarioOpt.isPresent() && passwordEncoder.matches(request.getPassword(), usuarioOpt.get().getPassword())) {
            Usuario user = usuarioOpt.get();
            String token = jwtUtil.generarToken(user.getEmail(), user.getRol());
            log.info("Login correcto: email={}, rol={}", user.getEmail(), user.getRol());

            return ResponseEntity.ok(new AuthResponse("Login exitoso.", token, user.getRol(), user.getEmail()));
        }

        log.warn("Login fallido para {}", request.getEmail());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("Credenciales incorrectas."));
    }
}
