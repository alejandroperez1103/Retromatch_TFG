package com.retromatch.backendspring.service;

import com.retromatch.backendspring.exception.BusinessException;
import com.retromatch.backendspring.model.*;
import com.retromatch.backendspring.repository.*;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PedidoService {

    private static final Logger log = LoggerFactory.getLogger(PedidoService.class);

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Autowired
    private ReservaCarritoRepository reservaCarritoRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Transactional
    public Pedido procesarCheckout(String emailUsuario, String direccionEnvio) {
        if (direccionEnvio == null || direccionEnvio.isBlank()) {
            throw new BusinessException("Debes indicar una direccion de envio valida.");
        }

        Usuario usuario = usuarioService.obtenerPorEmail(emailUsuario);
        List<ReservaCarrito> carrito = reservaCarritoRepository.findByUsuarioId(usuario.getId());

        if (carrito.isEmpty()) {
            throw new BusinessException("Tu carrito esta vacio. Anade al menos un articulo antes de pagar.");
        }

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setDireccionEnvio(direccionEnvio.trim());
        pedido.setNumeroPedido("RM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        pedido.setEstado("Pagado y Preparando Envio");

        pedido = pedidoRepository.save(pedido);

        for (ReservaCarrito reserva : carrito) {
            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setInventario(reserva.getInventario());
            detalle.setCantidad(reserva.getCantidad());
            detalle.setPrecioUnitario(reserva.getInventario().getProducto().getPrecio());

            detallePedidoRepository.save(detalle);
        }

        reservaCarritoRepository.deleteByUsuarioId(usuario.getId());
        log.info("Checkout completado: pedido={}, usuario={}, lineas={}", pedido.getNumeroPedido(), usuario.getEmail(), carrito.size());

        return pedido;
    }

    public List<Pedido> obtenerHistorialUsuario(String emailUsuario) {
        Usuario usuario = usuarioService.obtenerPorEmail(emailUsuario);
        return pedidoRepository.findByUsuarioId(usuario.getId());
    }
}
