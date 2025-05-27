package com.example.lbf.service.venta;

import com.example.lbf.entities.Venta;
import com.example.lbf.entities.Usuario;
import com.example.lbf.entities.ProductoVendido;
import com.example.lbf.entities.Producto;
import com.example.lbf.repository.VentaRepository;
import com.example.lbf.service.producto.ProductoService;
import com.example.lbf.repository.ProductoRepository;
import com.example.lbf.repository.ProductoVendidoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class VentaServiceImpl implements VentaService {

    @Autowired
    private VentaRepository ventaRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private ProductoVendidoRepository productoVendidoRepository;
    
    @Autowired
    private ProductoService productoService;

    @Override
    @Transactional
    public Venta crearVenta(Usuario usuario, List<ProductoVendido> productos, Boolean conIva) {
        Venta venta = new Venta();
        venta.setUsuario(usuario);
        venta.setFecha(LocalDate.now());
        venta.setConIva(conIva);
        
        // Calcular total de la venta
        BigDecimal total = BigDecimal.ZERO;
        for (ProductoVendido pv : productos) {
            Float subtotal = pv.getCantidad() * pv.getProducto().getPrecio() * (1 - pv.getDescuento() / 100);
            pv.setSubtotal(subtotal);
            total = total.add(BigDecimal.valueOf(subtotal));
            
            // Asociar a la venta
            pv.setVenta(venta);
            
            // Actualizar stock
            productoService.actualizarStock(pv.getProducto().getProductoId(), -pv.getCantidad());
        }
        
        venta.setTotal(total);
        venta.setProductosVendidos(productos);
        
        return ventaRepository.save(venta);
    }

    @Override
    @Transactional(readOnly = true)
    public Venta getVentaById(Long ventaId) {
        return ventaRepository.findById(ventaId).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Venta> getVentasByUsuario(Long usuarioId) {
        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);
        return ventaRepository.findByUsuario(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Venta> getVentasByFecha(LocalDate fecha) {
        return ventaRepository.findByFecha(fecha);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Venta> getVentasByRangoDeFechas(LocalDate fechaInicio, LocalDate fechaFin) {
        return ventaRepository.findByFechaBetween(fechaInicio, fechaFin);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calcularTotalVentas(LocalDate fechaInicio, LocalDate fechaFin) {
        BigDecimal total = ventaRepository.calcularTotalVentasPorRango(fechaInicio, fechaFin);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    @Transactional
    public void anularVenta(Long ventaId) {
        Optional<Venta> ventaOpt = ventaRepository.findById(ventaId);
        if (ventaOpt.isPresent()) {
            Venta venta = ventaOpt.get();
            
            // Devolver stock de productos
            for (ProductoVendido pv : venta.getProductosVendidos()) {
                productoService.actualizarStock(pv.getProducto().getProductoId(), pv.getCantidad());
            }
            
            ventaRepository.deleteById(ventaId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Venta> buscarVentas(String criterio) {
        return ventaRepository.buscarVentas(criterio);
    }
}
