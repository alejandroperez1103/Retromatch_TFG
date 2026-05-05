package com.retromatch.backendspring.repository;

import com.retromatch.backendspring.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // Ahora solo busca por el nombre del equipo
    List<Producto> findByEquipoContainingIgnoreCase(String equipo);
}