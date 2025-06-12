package com.example.lbf.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Getter
@Setter
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ventaId;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonBackReference
    private Usuario usuario;

    // Agregar relación muchos a uno con Cliente
    @ManyToOne
    @JoinColumn(name = "cliente_id")
    @JsonBackReference("cliente-venta")
    private Cliente cliente;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL)
    @JsonManagedReference("vendido-venta")
    private List<ProductoVendido> productosVendidos;

    private BigDecimal total;

    private LocalDate fecha;

    private Boolean conIva;

    private String hora;

    private String sucursal;

    private Boolean anulada = false;

}
