package com.example.lbf.dto.response;

import com.example.lbf.entities.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentaPorUsuarioDTO {
    private Usuario usuario;
    private BigDecimal total;
}