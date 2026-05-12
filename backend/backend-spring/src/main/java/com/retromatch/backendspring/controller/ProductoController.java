package com.retromatch.backendspring.controller;

import com.retromatch.backendspring.dto.StockResponse;
import com.retromatch.backendspring.model.Producto;
import com.retromatch.backendspring.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping
    public List<Producto> obtenerTodos() {
        return productoService.buscarPorFiltros(null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerPorIdOrThrow(id));
    }

    @GetMapping("/{id}/stock")
    public ResponseEntity<List<StockResponse>> obtenerStock(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerStockPorProducto(id));
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<Void> actualizarStock(
            @PathVariable Long id,
            @RequestBody List<StockResponse> stockItems) {
        productoService.actualizarStock(id, stockItems);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<Producto> guardarProducto(@RequestBody Producto producto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.guardarProducto(producto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @RequestBody Producto detallesProducto) {
        return ResponseEntity.ok(productoService.actualizarProducto(id, detallesProducto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }
}