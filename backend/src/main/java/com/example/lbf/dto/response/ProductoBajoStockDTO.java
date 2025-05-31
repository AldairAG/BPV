package com.example.lbf.dto.response;

import com.example.lbf.entities.Producto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ProductoBajoStockDTO {
    private Producto producto;
    private Float diferencia;

    // Constructor, getters y setters
}

