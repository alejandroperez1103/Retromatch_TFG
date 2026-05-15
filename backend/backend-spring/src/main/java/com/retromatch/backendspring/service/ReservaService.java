package com.retromatch.backendspring.service;

import com.retromatch.backendspring.exception.BusinessException;
import com.retromatch.backendspring.exception.ResourceNotFoundException;
import com.retromatch.backendspring.model.Inventario;
import com.retromatch.backendspring.model.ReservaCarrito;
import com.retromatch.backendspring.model.Usuario;
import com.retromatch.backendspring.repository.InventarioRepository;
import com.retromatch.backendspring.repository.ReservaCarritoRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservaService {

    private static final Logger log = LoggerFactory.getLogger(ReservaService.class);

    @Autowired
    private ReservaCarritoRepository reservaRepository;

    @Autowired
    private InventarioRepository inventarioRepository;

    @Autowired
    private UsuarioService usuarioService;

    public List<ReservaCarrito> obtenerCarrito(String emailUsuario) {
        Usuario usuario = usuarioService.obtenerPorEmail(emailUsuario);
        return reservaRepository.findByUsuarioId(usuario.getId());
    }

    @Transactional
    public ReservaCarrito anadirAlCarrito(String emailUsuario, Long productoId, String talla, Integer cantidad) {
        if (cantidad == null || cantidad < 1) {
            throw new BusinessException("La cantidad debe ser al menos 1.");
        }

        if (talla == null || talla.isBlank()) {
            throw new BusinessException("Selecciona una talla valida antes de reservar.");
        }

        Usuario usuario = usuarioService.obtenerPorEmail(emailUsuario);

        Inventario inventario = inventarioRepository.findByProductoIdAndTalla(productoId, talla)
                .orElseThrow(() -> new ResourceNotFoundException("La talla seleccionada no existe para este producto."));

        if (inventario.getCantidadStock() < cantidad) {
            throw new BusinessException("No queda stock disponible para la talla " + talla + ".");
        }

        inventario.setCantidadStock(inventario.getCantidadStock() - cantidad);
        inventarioRepository.save(inventario);

        ReservaCarrito reserva = new ReservaCarrito();
        reserva.setUsuario(usuario);
        reserva.setInventario(inventario);
        reserva.setCantidad(cantidad);
        reserva.setFechaExpiracion(LocalDateTime.now().plusDays(30));

        ReservaCarrito reservaGuardada = reservaRepository.save(reserva);
        log.info(
                "Reserva creada: reservaId={}, usuario={}, productoId={}, talla={}, cantidad={}",
                reservaGuardada.getId(),
                usuario.getEmail(),
                productoId,
                talla,
                cantidad
        );
        return reservaGuardada;
    }

    @Transactional
    public void eliminarReserva(String emailUsuario, Long reservaId) {
        Usuario usuario = usuarioService.obtenerPorEmail(emailUsuario);
        ReservaCarrito reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new ResourceNotFoundException("La reserva indicada no existe."));

        if (!reserva.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("No puedes eliminar una reserva que no te pertenece.");
        }

        restaurarStock(reserva);
        reservaRepository.delete(reserva);
        log.info("Reserva eliminada: reservaId={}, usuario={}", reservaId, usuario.getEmail());
    }

    @Transactional
    public void vaciarCarrito(String emailUsuario) {
        Usuario usuario = usuarioService.obtenerPorEmail(emailUsuario);
        List<ReservaCarrito> reservas = reservaRepository.findByUsuarioId(usuario.getId());

        for (ReservaCarrito reserva : reservas) {
            restaurarStock(reserva);
        }

        reservaRepository.deleteAll(reservas);
        log.info("Carrito vaciado: usuario={}, reservas={}", usuario.getEmail(), reservas.size());
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void liberarStockExpirado() {
        List<ReservaCarrito> expiradas = reservaRepository.findByFechaExpiracionBefore(LocalDateTime.now());

        for (ReservaCarrito reserva : expiradas) {
            restaurarStock(reserva);
            reservaRepository.delete(reserva);
        }

        if (!expiradas.isEmpty()) {
            log.info("Reservas expiradas liberadas: {}", expiradas.size());
        }
    }

    private void restaurarStock(ReservaCarrito reserva) {
        Inventario inventario = reserva.getInventario();
        inventario.setCantidadStock(inventario.getCantidadStock() + reserva.getCantidad());
        inventarioRepository.save(inventario);
    }
}
