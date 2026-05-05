package com.retromatch.backendspring.controller;

import com.retromatch.backendspring.model.Producto;
import com.retromatch.backendspring.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
// ✅ ELIMINADO @CrossOrigin — lo gestiona SecurityConfig globalmente
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    // ✅ AÑADIDO: GET /api/productos — devuelve todos
    @GetMapping
    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    // GET /api/productos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        return productoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Producto guardarProducto(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @RequestBody Producto detallesProducto) {
        return productoRepository.findById(id)
                .map(producto -> {
                    producto.setEquipo(detallesProducto.getEquipo());
                    producto.setAnio(detallesProducto.getAnio());
                    producto.setPrecio(detallesProducto.getPrecio());
                    producto.setImagenes(detallesProducto.getImagenes());
                    producto.setDescripcionHistorica(detallesProducto.getDescripcionHistorica());
                    producto.setCategoria(detallesProducto.getCategoria());
                    return ResponseEntity.ok(productoRepository.save(producto));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}