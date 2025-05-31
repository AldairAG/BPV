package com.example.lbf.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;

@Entity
@Getter
@Setter
public class ProductoVendido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productoVendidoId;

    @ManyToOne
    @JoinColumn(name = "venta_id")
    @JsonBackReference("vendido-venta")
    private Venta venta;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    @JsonBackReference("vendido-producto")
    private Producto producto;

    private Float cantidad;
    private Float precioUnitario;
    private Float descuento;
    private Float subtotal;
}
