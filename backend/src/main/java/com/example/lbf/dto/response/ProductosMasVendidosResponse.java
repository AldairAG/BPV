package com.example.lbf.dto.response;

import com.example.lbf.entities.Producto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class ProductosMasVendidosResponse {
    private Producto producto;
    private Integer cantidad;
    
}
