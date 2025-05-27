package com.example.lbf.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class MovimientoInventario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long movimientoId;
    
    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;
    
    private Float cantidad;
    
    private String tipoMovimiento; // ENTRADA, SALIDA, AJUSTE
    
    private String motivo;
    
    private LocalDateTime fecha;
    
    private Float stockAnterior;
    
    private Float stockNuevo;
    
    private String usuario; // Podría ser una relación con la entidad Usuario
}
