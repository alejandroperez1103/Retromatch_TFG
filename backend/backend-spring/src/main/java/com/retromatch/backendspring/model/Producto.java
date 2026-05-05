package com.retromatch.backendspring.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "Producto")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String equipo;

    @Column(nullable = false)
    private Integer anio;

    @Column(name = "descripcion_historica", columnDefinition = "TEXT")
    private String descripcionHistorica;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "categoria")
    private String categoria;

    // --- AQUÍ ESTÁ EL CAMBIO MÁGICO ---
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "producto_imagenes",
            joinColumns = @JoinColumn(name = "producto_id")
    )
    @Column(name = "imagen_url")
    private List<String> imagenes = new ArrayList<>();

    public Producto() {}

    // --- Getters y Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEquipo() { return equipo; }
    public void setEquipo(String equipo) { this.equipo = equipo; }

    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }

    public String getDescripcionHistorica() { return descripcionHistorica; }
    public void setDescripcionHistorica(String descripcionHistorica) { this.descripcionHistorica = descripcionHistorica; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    // Nuevos Getters y Setters para el Array de imágenes
    public List<String> getImagenes() { return imagenes; }
    public void setImagenes(List<String> imagenes) { this.imagenes = imagenes; }
}