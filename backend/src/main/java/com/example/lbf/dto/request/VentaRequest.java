package com.example.lbf.dto.request;

import java.util.List;

import com.example.lbf.entities.ProductoVendido;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
     * Clase interna para la solicitud de venta
     */
    @Schema(description = "Datos para la creación de una venta")
    @Getter
    @Setter
    public class VentaRequest {
        @Schema(description = "ID del usuario que realiza la venta")
        private Long usuarioId;
        
        @Schema(description = "Lista de productos vendidos con sus cantidades y precios", required = true)
        private List<ProductoVendido> productos;
        
        @Schema(description = "Indica si la venta incluye IVA", defaultValue = "true")
        private Boolean conIva;

        private Float descuento;

        private Long clienteId;

        private String sucursal;
    }
