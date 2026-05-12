package com.retromatch.backendspring.service;

import com.retromatch.backendspring.exception.BusinessException;
import com.retromatch.backendspring.model.Inventario;
import com.retromatch.backendspring.model.ReservaCarrito;
import com.retromatch.backendspring.model.Usuario;
import com.retromatch.backendspring.repository.InventarioRepository;
import com.retromatch.backendspring.repository.ReservaCarritoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock
    private ReservaCarritoRepository reservaRepository;

    @Mock
    private InventarioRepository inventarioRepository;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private ReservaService reservaService;

    @Test
    void shouldRejectReservationsWithoutAvailableStock() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("retro@match.com");

        Inventario inventario = new Inventario();
        inventario.setCantidadStock(0);
        inventario.setTalla("M");

        when(usuarioService.obtenerPorEmail("retro@match.com")).thenReturn(usuario);
        when(inventarioRepository.findByProductoIdAndTalla(99L, "M")).thenReturn(Optional.of(inventario));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> reservaService.anadirAlCarrito("retro@match.com", 99L, "M", 1)
        );

        assertEquals("No queda stock disponible para la talla M.", exception.getMessage());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void shouldRestoreStockWhenClearingTheCart() {
        Usuario usuario = new Usuario();
        usuario.setId(5L);
        usuario.setEmail("retro@match.com");

        Inventario inventario = new Inventario();
        inventario.setCantidadStock(2);
        inventario.setTalla("L");

        ReservaCarrito reserva = new ReservaCarrito();
        reserva.setUsuario(usuario);
        reserva.setInventario(inventario);
        reserva.setCantidad(2);

        when(usuarioService.obtenerPorEmail("retro@match.com")).thenReturn(usuario);
        when(reservaRepository.findByUsuarioId(5L)).thenReturn(List.of(reserva));

        reservaService.vaciarCarrito("retro@match.com");

        assertEquals(Integer.valueOf(4), inventario.getCantidadStock());
        verify(inventarioRepository).save(inventario);
        verify(reservaRepository).deleteAll(List.of(reserva));
    }
}
