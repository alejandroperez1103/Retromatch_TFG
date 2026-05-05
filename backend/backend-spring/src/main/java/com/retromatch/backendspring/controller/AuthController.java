package com.retromatch.backendspring.controller;

import com.retromatch.backendspring.model.Usuario;
import com.retromatch.backendspring.repository.UsuarioRepository;
import com.retromatch.backendspring.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
// ✅ CORREGIDO: eliminado @CrossOrigin — el CORS ya lo gestiona SecurityConfig globalmente
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private final String CLAVE_MAESTRA = "RETROMATCH_MASTER_26";

    @PostMapping("/registro")
    public ResponseEntity<String> registrarUsuario(@RequestBody RegistroRequest request) {
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: El email ya está registrado.");
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
        return ResponseEntity.ok("¡Usuario registrado con éxito en RetroMatch como " + nuevoUsuario.getRol() + "!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());

        if (usuarioOpt.isPresent() && passwordEncoder.matches(request.getPassword(), usuarioOpt.get().getPassword())) {
            Usuario user = usuarioOpt.get();
            String token = jwtUtil.generarToken(user.getEmail(), user.getRol());

            return ResponseEntity.ok(Map.of(
                    "mensaje", "¡Login exitoso!",
                    "token", token,
                    "rol", user.getRol(),
                    "email", user.getEmail()
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas");
    }
}

class RegistroRequest {
    private String email;
    private String password;
    private String codigoAdmin;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getCodigoAdmin() { return codigoAdmin; }
    public void setCodigoAdmin(String codigoAdmin) { this.codigoAdmin = codigoAdmin; }
}

class LoginRequest {
    private String email;
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}