package com.retromatch.backendspring.controller;

import com.retromatch.backendspring.dto.CheckoutRequest;
import com.retromatch.backendspring.model.Pedido;
import com.retromatch.backendspring.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping("/checkout")
    public ResponseEntity<Pedido> realizarCheckout(
            @RequestBody CheckoutRequest request,
            Authentication authentication
    ) {
        Pedido pedidoConfirmado = pedidoService.procesarCheckout(authentication.getName(), request.getDireccionEnvio());
        return ResponseEntity.ok(pedidoConfirmado);
    }

    @GetMapping
    public ResponseEntity<List<Pedido>> verHistorial(Authentication authentication) {
        return ResponseEntity.ok(pedidoService.obtenerHistorialUsuario(authentication.getName()));
    }
}
