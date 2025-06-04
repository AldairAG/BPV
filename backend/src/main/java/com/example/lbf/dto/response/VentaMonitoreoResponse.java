package com.example.lbf.dto.response;

import java.util.List;

import com.example.lbf.entities.Producto;
import com.example.lbf.entities.Usuario;
import com.example.lbf.entities.Venta;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VentaMonitoreoResponse {
    private Venta venta;
    private Usuario usuario;
    private List<Producto> productosVendidos;
}
