package com.example.lbf.service.reportes;

import com.example.lbf.dto.response.*;
import com.example.lbf.entities.Producto;
import com.example.lbf.entities.Usuario;
import com.example.lbf.entities.Venta;
import com.example.lbf.repository.ProductoVendidoRepository;
import com.example.lbf.repository.VentaRepository;
import com.example.lbf.repository.ProductoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReporteServiceImpl implements ReporteService {

    @Autowired
    private ProductoVendidoRepository productoVendidoRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductosMasVendidosResponse> getProductosMasVendidos(LocalDate fechaInicio, LocalDate fechaFin, int limite) {
        List<Object[]> resultados = productoVendidoRepository.findProductosMasVendidos(fechaInicio, fechaFin);

        List<ProductosMasVendidosResponse> productosVendidos = new ArrayList<>();
        int count = 0;

        for (Object[] resultado : resultados) {
            if (count >= limite)
                break;

            Producto producto = (Producto) resultado[0];
            Number cantidad = (Number) resultado[1];

            productosVendidos.add(new ProductosMasVendidosResponse(producto, cantidad.intValue()));
            
            count++;
        }

        return productosVendidos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<VentaPorUsuarioDTO> getVentasPorUsuario(LocalDate fechaInicio, LocalDate fechaFin) {
        List<Venta> ventas = ventaRepository.findByFechaBetween(fechaInicio, fechaFin);

        Map<Usuario, BigDecimal> ventasPorUsuarioMap = new HashMap<>();

        for (Venta venta : ventas) {
            Usuario usuario = venta.getUsuario();
            BigDecimal total = venta.getTotal();

            ventasPorUsuarioMap.put(usuario,
                    ventasPorUsuarioMap.getOrDefault(usuario, BigDecimal.ZERO).add(total));
        }

        // Convertir el Map a una lista de DTOs
        List<VentaPorUsuarioDTO> ventasPorUsuario = new ArrayList<>();
        
        for (Map.Entry<Usuario, BigDecimal> entry : ventasPorUsuarioMap.entrySet()) {
            ventasPorUsuario.add(new VentaPorUsuarioDTO(entry.getKey(), entry.getValue()));
        }
        
        return ventasPorUsuario;
    }

    @Override
    @Transactional(readOnly = true)
    public List<VentaPorCategoriaDTO> getVentasPorCategoria(LocalDate fechaInicio, LocalDate fechaFin) {
        List<Object[]> resultados = productoVendidoRepository.findVentasPorCategoria(fechaInicio, fechaFin);

        List<VentaPorCategoriaDTO> ventasPorCategoria = new ArrayList<>();

        for (Object[] resultado : resultados) {
            String categoria = (String) resultado[0];
            Number total = (Number) resultado[1];

            ventasPorCategoria.add(new VentaPorCategoriaDTO(
                categoria, 
                BigDecimal.valueOf(total.doubleValue())
            ));
        }

        return ventasPorCategoria;
    }

    @Override
    @Transactional(readOnly = true)
    public List<VentaDiariaDTO> getVentasDiarias(LocalDate fechaInicio, LocalDate fechaFin) {
        List<Venta> ventas = ventaRepository.findByFechaBetween(fechaInicio, fechaFin);

        Map<LocalDate, BigDecimal> ventasDiariasMap = new HashMap<>();

        for (Venta venta : ventas) {
            LocalDate fecha = venta.getFecha();
            BigDecimal total = venta.getTotal();

            ventasDiariasMap.put(fecha,
                    ventasDiariasMap.getOrDefault(fecha, BigDecimal.ZERO).add(total));
        }

        // Convertir el Map a una lista de DTOs
        List<VentaDiariaDTO> ventasDiarias = new ArrayList<>();
        
        for (Map.Entry<LocalDate, BigDecimal> entry : ventasDiariasMap.entrySet()) {
            ventasDiarias.add(new VentaDiariaDTO(entry.getKey(), entry.getValue()));
        }
        
        // Ordenar por fecha
        ventasDiarias.sort((a, b) -> a.getFecha().compareTo(b.getFecha()));
        
        return ventasDiarias;
    }

    @Override
    @Transactional(readOnly = true)
    public List<VentaMensualDTO> getVentasMensuales(int año) {
        LocalDate inicioAño = LocalDate.of(año, 1, 1);
        LocalDate finAño = LocalDate.of(año, 12, 31);

        List<Venta> ventas = ventaRepository.findByFechaBetween(inicioAño, finAño);

        Map<Integer, BigDecimal> ventasMensualesMap = new HashMap<>();

        for (Venta venta : ventas) {
            int mes = venta.getFecha().getMonthValue();
            BigDecimal total = venta.getTotal();

            ventasMensualesMap.put(mes,
                    ventasMensualesMap.getOrDefault(mes, BigDecimal.ZERO).add(total));
        }

        // Convertir el Map a una lista de DTOs
        List<VentaMensualDTO> ventasMensuales = new ArrayList<>();
        
        for (Map.Entry<Integer, BigDecimal> entry : ventasMensualesMap.entrySet()) {
            ventasMensuales.add(new VentaMensualDTO(entry.getKey(), entry.getValue()));
        }
        
        // Ordenar por mes
        ventasMensuales.sort((a, b) -> Integer.compare(a.getMes(), b.getMes()));
        
        return ventasMensuales;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calcularIngresoTotal(LocalDate fechaInicio, LocalDate fechaFin) {
        return ventaRepository.calcularTotalVentasPorRango(fechaInicio, fechaFin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoBajoStockDTO> getProductosBajoStock() {
        List<Producto> productos = productoRepository.findProductosConBajoStock();

        return productos.stream()
                .filter(producto -> producto.getStock() <= producto.getStockMinimo())
                .map(producto -> {
                    float porcentaje = producto.getStockMinimo() > 0 
                        ? producto.getStock() / producto.getStockMinimo() 
                        : 0;
                    return new ProductoBajoStockDTO(producto, porcentaje);
                })
                .collect(Collectors.toList());
    }
}
