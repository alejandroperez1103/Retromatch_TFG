package com.retromatch.backendspring.dto;

public class StockResponse {
    private Long id;
    private String talla;
    private Integer cantidad;

    public StockResponse() {}

    public StockResponse(Long id, String talla, Integer cantidad) {
        this.id = id;
        this.talla = talla;
        this.cantidad = cantidad;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTalla() { return talla; }
    public void setTalla(String talla) { this.talla = talla; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
}