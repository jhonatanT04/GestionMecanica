package mecanica.ec.cue.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mecanica.ec.cue.backend.model.MovimientoInventario;
import mecanica.ec.cue.backend.model.OrdenDeTrabajo;
import mecanica.ec.cue.backend.model.Producto;
import mecanica.ec.cue.backend.model.TipoMovimiento;
import mecanica.ec.cue.backend.repository.MovimientoInventarioRepository;

@Service
public class MovimientoInventarioService {

    private final MovimientoInventarioRepository movimientoInventarioRepository;
    private final ProductoService productoService;

    public MovimientoInventarioService(MovimientoInventarioRepository movimientoInventarioRepository,
            ProductoService productoService) {
        this.movimientoInventarioRepository = movimientoInventarioRepository;
        this.productoService = productoService;
    }

    public List<MovimientoInventario> listar(Long productoId) {
        if (productoId != null) {
            return movimientoInventarioRepository.findByProductoId(productoId);
        }
        return movimientoInventarioRepository.findAll();
    }

    @Transactional
    public MovimientoInventario registrarEntradaManual(MovimientoInventario movimiento) {
        if (movimiento.getProducto() == null || movimiento.getProducto().getId() == null) {
            throw new IllegalArgumentException("Debe indicar el producto");
        }
        if (movimiento.getCantidad() == null || movimiento.getCantidad() <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
        }
        Producto producto = productoService.obtener(movimiento.getProducto().getId());

        movimiento.setId(null);
        movimiento.setTipo(TipoMovimiento.ENTRADA);
        movimiento.setProducto(producto);
        movimiento.setReferenciaOrden(null);
        if (movimiento.getFecha() == null) {
            movimiento.setFecha(LocalDate.now());
        }

        productoService.reponerStock(producto.getId(), movimiento.getCantidad());
        return movimientoInventarioRepository.save(movimiento);
    }

    public MovimientoInventario registrarSalidaPorItem(Producto producto, int cantidad, OrdenDeTrabajo orden) {
        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setTipo(TipoMovimiento.SALIDA);
        movimiento.setCantidad(cantidad);
        movimiento.setFecha(LocalDate.now());
        movimiento.setProducto(producto);
        movimiento.setReferenciaOrden(orden);
        return movimientoInventarioRepository.save(movimiento);
    }

    public MovimientoInventario registrarEntradaPorReversion(Producto producto, int cantidad, OrdenDeTrabajo orden) {
        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setTipo(TipoMovimiento.ENTRADA);
        movimiento.setCantidad(cantidad);
        movimiento.setFecha(LocalDate.now());
        movimiento.setProducto(producto);
        movimiento.setReferenciaOrden(orden);
        return movimientoInventarioRepository.save(movimiento);
    }
}
