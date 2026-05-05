package com.retromatch.backendspring.service;

import com.retromatch.backendspring.model.Inventario;
import com.retromatch.backendspring.model.ReservaCarrito;
import com.retromatch.backendspring.model.Usuario;
import com.retromatch.backendspring.repository.InventarioRepository;
import com.retromatch.backendspring.repository.ReservaCarritoRepository;
import com.retromatch.backendspring.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservaService {

    @Autowired
    private ReservaCarritoRepository reservaRepository;

    @Autowired
    private InventarioRepository inventarioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<ReservaCarrito> obtenerCarrito(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }

    @Transactional
    public ReservaCarrito añadirAlCarrito(Long usuarioId, Long productoId, String talla, Integer cantidad) {
        // 1. Buscamos al usuario y el inventario exacto (Producto + Talla)
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Inventario inventario = inventarioRepository.findByProductoIdAndTalla(productoId, talla)
                .orElseThrow(() -> new RuntimeException("Talla no encontrada para este producto"));

        // 2. Comprobamos si hay stock suficiente
        if (inventario.getCantidadStock() < cantidad) {
            throw new RuntimeException("No hay stock suficiente para la talla " + talla);
        }

        // 3. Restamos el stock para que nadie más lo pueda comprar (Bloqueo)
        inventario.setCantidadStock(inventario.getCantidadStock() - cantidad);
        inventarioRepository.save(inventario);

        // 4. Creamos la reserva con 15 minutos de caducidad
        ReservaCarrito reserva = new ReservaCarrito();
        reserva.setUsuario(usuario);
        reserva.setInventario(inventario);
        reserva.setCantidad(cantidad);
        reserva.setFechaExpiracion(LocalDateTime.now().plusMinutes(15));

        return reservaRepository.save(reserva);
    }

    // EL BARRENDERO AUTOMÁTICO: Se ejecuta solo cada 60 segundos (60000 milisegundos)
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void liberarStockExpirado() {
        List<ReservaCarrito> expiradas = reservaRepository.findByFechaExpiracionBefore(LocalDateTime.now());

        for (ReservaCarrito reserva : expiradas) {
            // Devolvemos el stock a la estantería
            Inventario inventario = reserva.getInventario();
            inventario.setCantidadStock(inventario.getCantidadStock() + reserva.getCantidad());
            inventarioRepository.save(inventario);

            // Borramos el carrito caducado
            reservaRepository.delete(reserva);
        }
    }
}