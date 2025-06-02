package com.example.lbf.dto.request;

import java.util.List;
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
    private String tipo;
    private List<Float> descuentos; // Lista de descuentos en porcentaje
}
