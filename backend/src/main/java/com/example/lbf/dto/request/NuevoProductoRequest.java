package com.example.lbf.dto.request;

import java.util.List;
import com.example.lbf.entities.Categoria;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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
    private String sucursal;
    private List<Float> descuentos; // Lista de descuentos en porcentaje
}
