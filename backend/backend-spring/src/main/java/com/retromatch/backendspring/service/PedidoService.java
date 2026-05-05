package com.retromatch.backendspring.service;

import com.retromatch.backendspring.model.*;
import com.retromatch.backendspring.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Autowired
    private ReservaCarritoRepository reservaCarritoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // @Transactional asegura que si algo falla a medias (ej. se va la luz), se cancele toda la compra
    @Transactional
    public Pedido procesarCheckout(Long usuarioId, String direccionEnvio) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 1. Buscamos qué tiene el usuario en el carrito
        List<ReservaCarrito> carrito = reservaCarritoRepository.findByUsuarioId(usuarioId);

        if (carrito.isEmpty()) {
            throw new RuntimeException("El carrito está vacío. No hay nada que comprar.");
        }

        // 2. Creamos el Pedido Principal (La cabecera de la factura)
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setDireccionEnvio(direccionEnvio);
        // Generamos un número de pedido aleatorio y único (Ej: RM-A1B2C3D4)
        pedido.setNumeroPedido("RM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        pedido.setEstado("Pagado y Preparando Envío");

        pedido = pedidoRepository.save(pedido);

        // 3. Pasamos las cosas del carrito a los Detalles del Pedido
        for (ReservaCarrito reserva : carrito) {
            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setInventario(reserva.getInventario());
            detalle.setCantidad(reserva.getCantidad());

            // FOTOGRAFÍA DEL PRECIO: Guardamos el precio que tiene la camiseta hoy
            detalle.setPrecioUnitario(reserva.getInventario().getProducto().getPrecio());

            detallePedidoRepository.save(detalle);
        }

        // 4. ¡Compra finalizada! Vaciamos el carrito del usuario.
        // (El stock en el inventario no se toca porque ya lo restamos al añadir al carrito)
        reservaCarritoRepository.deleteByUsuarioId(usuarioId);

        return pedido;
    }

    // Método extra para que el usuario pueda ver sus compras pasadas
    public List<Pedido> obtenerHistorialUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId);
    }
}