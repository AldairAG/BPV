package com.example.lbf.entities;

import java.util.List;

import com.example.lbf.entities.converters.DescuentosConverter;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Convert;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.JoinColumn;

@Entity
@Getter
@Setter
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productoId;

    private String nombre;
    private Float precio;
    private Float stock;
    private String codigoBarras;
    private Float precioCompra;
    private Float stockMinimo;
    private String tipo;
    private Boolean activo;
    private String sucursal;
    
    // Nuevo campo para descuentos
    @Convert(converter = DescuentosConverter.class)
    @Column(name = "descuentos", columnDefinition = "TEXT")
    private List<Float> descuentos;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    //@JsonBackReference("categoria-producto")
    private Categoria categoria;

    @OneToMany(mappedBy = "producto")
    @JsonManagedReference("vendido-producto")
    private List<ProductoVendido> productoVentas;
}
