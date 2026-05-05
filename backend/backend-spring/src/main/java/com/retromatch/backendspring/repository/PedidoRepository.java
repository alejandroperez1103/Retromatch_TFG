package com.retromatch.backendspring.repository;

import com.retromatch.backendspring.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Para la vista de "Mi Historial de Compras" en el perfil del usuario
    List<Pedido> findByUsuarioId(Long usuarioId);

    // Para cuando el usuario busque su pedido por el código de seguimiento
    Optional<Pedido> findByNumeroPedido(String numeroPedido);
}