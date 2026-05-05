package com.retromatch.backendspring.controller;

import com.retromatch.backendspring.model.Pedido;
import com.retromatch.backendspring.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    // Ruta a la que llamará React cuando el usuario le dé al botón de "Pagar"
    @PostMapping("/checkout")
    public ResponseEntity<?> realizarCheckout(@RequestBody CheckoutRequest request) {
        try {
            Pedido pedidoConfirmado = pedidoService.procesarCheckout(request.getUsuarioId(), request.getDireccionEnvio());
            return ResponseEntity.ok(pedidoConfirmado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Ruta para la pantalla de "Mi Perfil > Mis Pedidos" en React
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Pedido>> verHistorial(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(pedidoService.obtenerHistorialUsuario(usuarioId));
    }
}

// Mini-clase DTO para recibir los datos del formulario de pago
class CheckoutRequest {
    private Long usuarioId;
    private String direccionEnvio;

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getDireccionEnvio() { return direccionEnvio; }
    public void setDireccionEnvio(String direccionEnvio) { this.direccionEnvio = direccionEnvio; }
}