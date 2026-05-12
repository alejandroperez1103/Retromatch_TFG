package com.retromatch.backendspring.service;

import com.retromatch.backendspring.dto.StockResponse;
import com.retromatch.backendspring.exception.ResourceNotFoundException;
import com.retromatch.backendspring.model.Inventario;
import com.retromatch.backendspring.model.Producto;
import com.retromatch.backendspring.repository.InventarioRepository;
import com.retromatch.backendspring.repository.ProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private static final Logger log = LoggerFactory.getLogger(ProductoService.class);

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private InventarioRepository inventarioRepository;

    public List<Producto> buscarPorFiltros(String equipo) {
        if (equipo != null && !equipo.isEmpty()) {
            return productoRepository.findByEquipoContainingIgnoreCase(equipo);
        }
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    public Producto obtenerPorIdOrThrow(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
    }

    public List<StockResponse> obtenerStockPorProducto(Long productoId) {
        obtenerPorIdOrThrow(productoId);
        return inventarioRepository.findByProductoId(productoId).stream()
                .map(this::mapToStockResponse)
                .toList();
    }

    @Transactional
    public void actualizarStock(Long productoId, List<StockResponse> stockItems) {
        Producto producto = obtenerPorIdOrThrow(productoId);

        inventarioRepository.deleteByProductoId(productoId);
        inventarioRepository.flush();

        List<Inventario> nuevosItems = stockItems.stream()
                .filter(s -> s.getCantidad() != null && s.getCantidad() > 0)
                .map(s -> {
                    Inventario inv = new Inventario();
                    inv.setProducto(producto);
                    inv.setTalla(s.getTalla());
                    inv.setCantidadStock(s.getCantidad());
                    return inv;
                })
                .toList();

        inventarioRepository.saveAll(nuevosItems);
        log.info("Stock actualizado para producto id={}", productoId);
    }

    public Producto guardarProducto(Producto producto) {
        Producto productoGuardado = productoRepository.save(producto);
        log.info("Producto guardado: id={}, equipo={}", productoGuardado.getId(), productoGuardado.getEquipo());
        return productoGuardado;
    }

    public Producto actualizarProducto(Long id, Producto detallesProducto) {
        Producto producto = obtenerPorIdOrThrow(id);
        producto.setEquipo(detallesProducto.getEquipo());
        producto.setAnio(detallesProducto.getAnio());
        producto.setPrecio(detallesProducto.getPrecio());
        producto.setImagenes(detallesProducto.getImagenes());
        producto.setDescripcionHistorica(detallesProducto.getDescripcionHistorica());
        producto.setCategoria(detallesProducto.getCategoria());
        Producto productoActualizado = productoRepository.save(producto);
        log.info("Producto actualizado: id={}, equipo={}", productoActualizado.getId(), productoActualizado.getEquipo());
        return productoActualizado;
    }

    public void eliminarProducto(Long id) {
        Producto producto = obtenerPorIdOrThrow(id);
        productoRepository.deleteById(id);
        log.info("Producto eliminado: id={}, equipo={}", producto.getId(), producto.getEquipo());
    }

    private StockResponse mapToStockResponse(Inventario inventario) {
        return new StockResponse(
                inventario.getId(),
                inventario.getTalla(),
                inventario.getCantidadStock()
        );
    }
}