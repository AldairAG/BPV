package com.example.lbf.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Getter
@Setter
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    private String contrasena;

    private String nombre;

    private LocalDateTime ultimoAcceso;

    private Boolean estado;

    private String rol;

    @OneToMany(mappedBy = "usuario")
    @JsonManagedReference
    private List<Venta> ventas;
}