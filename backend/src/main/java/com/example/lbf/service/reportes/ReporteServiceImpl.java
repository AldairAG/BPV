package com.example.lbf.service.reportes;

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
    public Map<Producto, Integer> getProductosMasVendidos(LocalDate fechaInicio, LocalDate fechaFin, int limite) {
        List<Object[]> resultados = productoVendidoRepository.findProductosMasVendidos(fechaInicio, fechaFin);
        
        Map<Producto, Integer> productosVendidos = new HashMap<>();
        int count = 0;
        
        for (Object[] resultado : resultados) {
            if (count >= limite) break;
            
            Producto producto = (Producto) resultado[0];
            Number cantidad = (Number) resultado[1];
            
            productosVendidos.put(producto, cantidad.intValue());
            count++;
        }
        
        return productosVendidos;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Usuario, BigDecimal> getVentasPorUsuario(LocalDate fechaInicio, LocalDate fechaFin) {
        List<Venta> ventas = ventaRepository.findByFechaBetween(fechaInicio, fechaFin);
        
        Map<Usuario, BigDecimal> ventasPorUsuario = new HashMap<>();
        
        for (Venta venta : ventas) {
            Usuario usuario = venta.getUsuario();
            BigDecimal total = venta.getTotal();
            
            ventasPorUsuario.put(usuario, 
                ventasPorUsuario.getOrDefault(usuario, BigDecimal.ZERO).add(total));
        }
        
        return ventasPorUsuario;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, BigDecimal> getVentasPorCategoria(LocalDate fechaInicio, LocalDate fechaFin) {
        List<Object[]> resultados = productoVendidoRepository.findVentasPorCategoria(fechaInicio, fechaFin);
        
        Map<String, BigDecimal> ventasPorCategoria = new HashMap<>();
        
        for (Object[] resultado : resultados) {
            String categoria = (String) resultado[0];
            Number total = (Number) resultado[1];
            
            ventasPorCategoria.put(categoria, BigDecimal.valueOf(total.doubleValue()));
        }
        
        return ventasPorCategoria;
    }    @Override
    @Transactional(readOnly = true)
    public Map<LocalDate, BigDecimal> getVentasDiarias(LocalDate fechaInicio, LocalDate fechaFin) {
        List<Venta> ventas = ventaRepository.findByFechaBetween(fechaInicio, fechaFin);
        
        Map<LocalDate, BigDecimal> ventasDiarias = new HashMap<>();
        
        for (Venta venta : ventas) {
            LocalDate fecha = venta.getFecha();
            BigDecimal total = venta.getTotal();
            
            ventasDiarias.put(fecha, 
                ventasDiarias.getOrDefault(fecha, BigDecimal.ZERO).add(total));
        }
        
        return ventasDiarias;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Integer, BigDecimal> getVentasMensuales(int año) {
        LocalDate inicioAño = LocalDate.of(año, 1, 1);
        LocalDate finAño = LocalDate.of(año, 12, 31);
        
        List<Venta> ventas = ventaRepository.findByFechaBetween(inicioAño, finAño);
        
        Map<Integer, BigDecimal> ventasMensuales = new HashMap<>();
        
        for (Venta venta : ventas) {
            int mes = venta.getFecha().getMonthValue();
            BigDecimal total = venta.getTotal();
            
            ventasMensuales.put(mes, 
                ventasMensuales.getOrDefault(mes, BigDecimal.ZERO).add(total));
        }
        
        return ventasMensuales;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calcularIngresoTotal(LocalDate fechaInicio, LocalDate fechaFin) {
        return ventaRepository.calcularTotalVentasPorRango(fechaInicio, fechaFin);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Producto, Float> getProductosBajoStock() {
        List<Producto> productos = productoRepository.findByStockLessThan(10.0f);
        
        return productos.stream()
            .collect(Collectors.toMap(
                producto -> producto,
                Producto::getStock
            ));
    }
}
