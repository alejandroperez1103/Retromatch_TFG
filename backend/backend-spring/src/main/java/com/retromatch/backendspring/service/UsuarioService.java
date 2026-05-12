package com.retromatch.backendspring.service;

import com.retromatch.backendspring.exception.ResourceNotFoundException;
import com.retromatch.backendspring.model.Usuario;
import com.retromatch.backendspring.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
