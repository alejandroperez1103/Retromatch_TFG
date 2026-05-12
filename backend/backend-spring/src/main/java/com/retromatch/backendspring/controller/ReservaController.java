package com.retromatch.backendspring.controller;

import com.retromatch.backendspring.dto.MessageResponse;
import com.retromatch.backendspring.dto.ReservaRequest;
import com.retromatch.backendspring.model.ReservaCarrito;
import com.retromatch.backendspring.service.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @GetMapping
    public ResponseEntity<List<ReservaCarrito>> verCarrito(Authentication authentication) {
        return ResponseEntity.ok(reservaService.obtenerCarrito(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<MessageResponse> anadirAlCarrito(
            @RequestBody ReservaRequest request,
            Authentication authentication
    ) {
        reservaService.anadirAlCarrito(
                authentication.getName(),
                request.getProductoId(),
                request.getTalla(),
                request.getCantidad()
        );
        return ResponseEntity.ok(new MessageResponse("Articulo reservado. Tienes 15 minutos para completar la compra."));
    }

    @DeleteMapping("/{reservaId}")
    public ResponseEntity<Void> eliminarReserva(@PathVariable Long reservaId, Authentication authentication) {
        reservaService.eliminarReserva(authentication.getName(), reservaId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> vaciarCarrito(Authentication authentication) {
        reservaService.vaciarCarrito(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
