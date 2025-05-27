package com.example.lbf.service.inventario;

import com.example.lbf.entities.Producto;
import com.example.lbf.entities.MovimientoInventario;
import com.example.lbf.repository.ProductoRepository;
import com.example.lbf.repository.MovimientoInventarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class InventarioServiceImpl implements InventarioService {

    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private MovimientoInventarioRepository movimientoInventarioRepository;

    @Override
    @Transactional
    public boolean actualizarStock(Long productoId, Float cantidad, String tipoMovimiento) {
        Optional<Producto> productoOpt = productoRepository.findById(productoId);
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            Float stockAnterior = producto.getStock();
            Float stockNuevo;
            
            // Calcular nuevo stock según el tipo de movimiento
            if ("ENTRADA".equals(tipoMovimiento)) {
                stockNuevo = stockAnterior + Math.abs(cantidad);
            } else if ("SALIDA".equals(tipoMovimiento)) {
                stockNuevo = stockAnterior - Math.abs(cantidad);
                // Verificar que no quede stock negativo
                if (stockNuevo < 0) {
                    return false;
                }
            } else if ("AJUSTE".equals(tipoMovimiento)) {
                stockNuevo = cantidad; // En ajuste, se establece directamente el nuevo valor
            } else {
                return false;
            }
            
            // Actualizar stock del producto
            producto.setStock(stockNuevo);
            productoRepository.save(producto);
            
            // Registrar movimiento
            MovimientoInventario movimiento = new MovimientoInventario();
            movimiento.setProducto(producto);
            movimiento.setCantidad(cantidad);
            movimiento.setTipoMovimiento(tipoMovimiento);
            movimiento.setMotivo("Actualización de stock");
            movimiento.setFecha(LocalDateTime.now());
            movimiento.setStockAnterior(stockAnterior);
            movimiento.setStockNuevo(stockNuevo);
            
            movimientoInventarioRepository.save(movimiento);
            
            return true;
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public Float getStockActual(Long productoId) {
        Optional<Producto> productoOpt = productoRepository.findById(productoId);
        return productoOpt.map(Producto::getStock).orElse(0.0f);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> getProductosBajoStock(Float umbral) {
        return productoRepository.findByStockLessThan(umbral);
    }

    @Override
    @Transactional
    public void registrarEntradaInventario(Long productoId, Float cantidad, String motivo) {
        Optional<Producto> productoOpt = productoRepository.findById(productoId);
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            Float stockAnterior = producto.getStock();
            Float stockNuevo = stockAnterior + Math.abs(cantidad);
            
            // Actualizar stock
            producto.setStock(stockNuevo);
            productoRepository.save(producto);
            
            // Registrar movimiento
            MovimientoInventario movimiento = new MovimientoInventario();
            movimiento.setProducto(producto);
            movimiento.setCantidad(Math.abs(cantidad));
            movimiento.setTipoMovimiento("ENTRADA");
            movimiento.setMotivo(motivo);
            movimiento.setFecha(LocalDateTime.now());
            movimiento.setStockAnterior(stockAnterior);
            movimiento.setStockNuevo(stockNuevo);
            
            movimientoInventarioRepository.save(movimiento);
        }
    }

    @Override
    @Transactional
    public void registrarSalidaInventario(Long productoId, Float cantidad, String motivo) {
        Optional<Producto> productoOpt = productoRepository.findById(productoId);
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            Float stockAnterior = producto.getStock();
            Float cantidadSalida = Math.abs(cantidad);
            
            // Verificar stock suficiente
            if (stockAnterior >= cantidadSalida) {
                Float stockNuevo = stockAnterior - cantidadSalida;
                
                // Actualizar stock
                producto.setStock(stockNuevo);
                productoRepository.save(producto);
                
                // Registrar movimiento
                MovimientoInventario movimiento = new MovimientoInventario();
                movimiento.setProducto(producto);
                movimiento.setCantidad(cantidadSalida);
                movimiento.setTipoMovimiento("SALIDA");
                movimiento.setMotivo(motivo);
                movimiento.setFecha(LocalDateTime.now());
                movimiento.setStockAnterior(stockAnterior);
                movimiento.setStockNuevo(stockNuevo);
                
                movimientoInventarioRepository.save(movimiento);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Object[]> getHistorialMovimientos(Long productoId) {
        List<MovimientoInventario> movimientos = movimientoInventarioRepository.findMovimientosByProductoId(productoId);
        List<Object[]> resultado = new ArrayList<>();
        
        for (MovimientoInventario movimiento : movimientos) {
            Object[] datos = {
                movimiento.getFecha(),
                movimiento.getTipoMovimiento(),
                movimiento.getCantidad(),
                movimiento.getStockAnterior(),
                movimiento.getStockNuevo(),
                movimiento.getMotivo()
            };
            resultado.add(datos);
        }
        
        return resultado;
    }

    @Override
    @Transactional
    public void realizarInventarioFisico(Map<Long, Float> conteoProductos) {
        for (Map.Entry<Long, Float> entry : conteoProductos.entrySet()) {
            Long productoId = entry.getKey();
            Float cantidadReal = entry.getValue();
            
            Optional<Producto> productoOpt = productoRepository.findById(productoId);
            if (productoOpt.isPresent()) {
                Producto producto = productoOpt.get();
                Float stockActual = producto.getStock();
                
                // Si hay diferencia, hacer ajuste
                if (!stockActual.equals(cantidadReal)) {
                    Float diferencia = cantidadReal - stockActual;
                    String tipoMovimiento = diferencia > 0 ? "ENTRADA" : "SALIDA";
                    String motivo = "Ajuste por inventario físico";
                    
                    // Actualizar stock
                    producto.setStock(cantidadReal);
                    productoRepository.save(producto);
                    
                    // Registrar movimiento
                    MovimientoInventario movimiento = new MovimientoInventario();
                    movimiento.setProducto(producto);
                    movimiento.setCantidad(Math.abs(diferencia));
                    movimiento.setTipoMovimiento(tipoMovimiento);
                    movimiento.setMotivo(motivo);
                    movimiento.setFecha(LocalDateTime.now());
                    movimiento.setStockAnterior(stockActual);
                    movimiento.setStockNuevo(cantidadReal);
                    
                    movimientoInventarioRepository.save(movimiento);
                }
            }
        }
    }
}
