package com.example.lbf.dto.request;

import com.example.lbf.entities.Categoria;

import lombok.Getter;

@Getter
public class NuevoProductoRequest {
    private Boolean activo;
    private Categoria categoria;
    private String nombre;
    private String codigoBarras;
    private Float precioCosto;
    private Float precioVenta;
    private Float stock;
    private Float stockMinimo;

}
