package com.retromatch.backendspring.repository;

import com.retromatch.backendspring.model.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {

    // Saca la lista de las camisetas de una factura concreta
    List<DetallePedido> findByPedidoId(Long pedidoId);
}