package com.retromatch.backendspring.repository;

import com.retromatch.backendspring.model.ReservaCarrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservaCarritoRepository extends JpaRepository<ReservaCarrito, Long> {

    // Para cargar la pantalla del carrito del usuario en React
    List<ReservaCarrito> findByUsuarioId(Long usuarioId);

    // El "barrendero": busca los carritos que ya han pasado de los 15 minutos
    List<ReservaCarrito> findByFechaExpiracionBefore(LocalDateTime fechaActual);

    // Para vaciar de golpe el carrito cuando el usuario termine de pagar
    void deleteByUsuarioId(Long usuarioId);
}