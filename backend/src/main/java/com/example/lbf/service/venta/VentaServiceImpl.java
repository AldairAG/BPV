package com.example.lbf.service.venta;

import com.example.lbf.entities.Venta;
import com.example.lbf.entities.Usuario;
import com.example.lbf.dto.request.VentaRequest;
import com.example.lbf.entities.ProductoVendido;
import com.example.lbf.repository.ClienteRepository;
import com.example.lbf.repository.VentaRepository;
import com.example.lbf.service.producto.ProductoService;
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
    private ProductoService productoService;

    @Autowired
    private ClienteRepository clienteRepository;

    @Override
    @Transactional
    public Venta crearVenta(Usuario usuario, VentaRequest ventaRequest) {

        Venta venta = new Venta();
        venta.setUsuario(usuario);
        venta.setFecha(LocalDate.now());
        java.time.ZoneOffset zonaCDMX = java.time.ZoneOffset.of("-06:00");
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a");
        String horaFormateada = java.time.ZonedDateTime.now(zonaCDMX).format(formatter);
        venta.setHora(horaFormateada);
        venta.setConIva(ventaRequest.getConIva());
        venta.setSucursal(ventaRequest.getSucursal());

        if (ventaRequest.getClienteId() != null) {
            clienteRepository.findById(ventaRequest.getClienteId())
                .ifPresent(cliente -> {
                venta.setCliente(cliente);
                });
        }

        // Calcular total de la venta
        BigDecimal total = BigDecimal.ZERO;
        for (ProductoVendido pv : ventaRequest.getProductos()) {
            Float subtotal = pv.getCantidad() * pv.getProducto().getPrecio() * (1 - pv.getDescuento() / 100);
            pv.setSubtotal(subtotal);
            total = total.add(BigDecimal.valueOf(subtotal));

            // Asociar a la venta
            pv.setVenta(venta);

            // Actualizar stock
            productoService.actualizarStock(pv.getProducto().getProductoId(), -pv.getCantidad());
        }

        // Si conIva es true, agregar el 16% al total
        if (ventaRequest.getConIva() != null && ventaRequest.getConIva()) {
            BigDecimal iva = total.multiply(BigDecimal.valueOf(0.16));
            total = total.add(iva);
        }

        venta.setTotal(total);
        venta.setProductosVendidos(ventaRequest.getProductos());

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
    }    @Override
    @Transactional
    public void anularVenta(Long ventaId) {
        Optional<Venta> ventaOpt = ventaRepository.findById(ventaId);
        if (ventaOpt.isPresent()) {
            Venta venta = ventaOpt.get();
            
            // Marcar la venta como anulada
            venta.setAnulada(true);
            
            // Devolver stock de productos
            for (ProductoVendido pv : venta.getProductosVendidos()) {
                productoService.actualizarStock(pv.getProducto().getProductoId(), pv.getCantidad());
            }
            
            // Guardar los cambios
            ventaRepository.save(venta);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Venta> buscarVentas(String criterio) {
        return ventaRepository.buscarVentas(criterio);
    }
}
