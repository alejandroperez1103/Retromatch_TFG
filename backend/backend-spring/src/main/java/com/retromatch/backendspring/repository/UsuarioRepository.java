package com.retromatch.backendspring.repository;

import com.retromatch.backendspring.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// FÍJATE AQUÍ: Ahora es <Usuario, Long>
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
}