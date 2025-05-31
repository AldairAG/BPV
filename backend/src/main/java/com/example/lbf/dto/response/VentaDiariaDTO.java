package com.example.lbf.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentaDiariaDTO {
    private LocalDate fecha;
    private BigDecimal total;
}