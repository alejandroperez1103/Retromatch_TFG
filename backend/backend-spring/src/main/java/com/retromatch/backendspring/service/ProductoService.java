package com.retromatch.backendspring.service;

import com.retromatch.backendspring.model.Producto;
import com.retromatch.backendspring.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    // Solo filtramos por equipo
    public List<Producto> buscarPorFiltros(String equipo) {
        if (equipo != null && !equipo.isEmpty()) {
            return productoRepository.findByEquipoContainingIgnoreCase(equipo);
        }
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    public Producto guardarProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    public void eliminarProducto(Long id) {
        productoRepository.deleteById(id);
    }
}