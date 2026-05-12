package com.retromatch.backendspring.repository;

import com.retromatch.backendspring.model.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {
    List<Inventario> findByProductoId(Long productoId);
    void deleteByProductoId(Long productoId);
    Optional<Inventario> findByProductoIdAndTalla(Long productoId, String talla);
}