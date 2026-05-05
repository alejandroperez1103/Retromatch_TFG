package com.retromatch.backendspring.controller;

import com.retromatch.backendspring.model.ReservaCarrito;
import com.retromatch.backendspring.service.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<ReservaCarrito>> verCarrito(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(reservaService.obtenerCarrito(usuarioId));
    }

    @PostMapping("/añadir")
    public ResponseEntity<String> añadirAlCarrito(@RequestBody ReservaRequest request) {
        try {
            reservaService.añadirAlCarrito(
                    request.getUsuarioId(),
                    request.getProductoId(),
                    request.getTalla(),
                    request.getCantidad()
            );
            return ResponseEntity.ok("Añadido al carrito. Tienes 15 minutos para completar la compra.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}

// DTO Actualizado para recibir la Talla y la Cantidad desde React
class ReservaRequest {
    private Long usuarioId;
    private Long productoId;
    private String talla;
    private Integer cantidad;

    // Getters y Setters
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }
    public String getTalla() { return talla; }
    public void setTalla(String talla) { this.talla = talla; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
}