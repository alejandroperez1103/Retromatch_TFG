package com.retromatch.backendspring.repository;

import com.retromatch.backendspring.model.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {

    // Para ver todas las tallas y stock de una camiseta concreta
    List<Inventario> findByProductoId(Long productoId);

    // Para buscar exactamente la camiseta y talla que el usuario quiere meter al carrito
    Optional<Inventario> findByProductoIdAndTalla(Long productoId, String talla);
}