package mecanica.ec.cue.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mecanica.ec.cue.backend.model.ItemOrden;
import mecanica.ec.cue.backend.model.OrdenDeTrabajo;
import mecanica.ec.cue.backend.model.Producto;
import mecanica.ec.cue.backend.model.TipoItem;
import mecanica.ec.cue.backend.repository.FacturaRepository;
import mecanica.ec.cue.backend.repository.ItemOrdenRepository;
import mecanica.ec.cue.backend.repository.OrdenDeTrabajoRepository;

@Service
public class ItemOrdenService {

    private final ItemOrdenRepository itemOrdenRepository;
    private final OrdenDeTrabajoRepository ordenDeTrabajoRepository;
    private final ProductoService productoService;
    private final MovimientoInventarioService movimientoInventarioService;
    private final FacturaRepository facturaRepository;

    public ItemOrdenService(ItemOrdenRepository itemOrdenRepository, OrdenDeTrabajoRepository ordenDeTrabajoRepository,
            ProductoService productoService, MovimientoInventarioService movimientoInventarioService,
            FacturaRepository facturaRepository) {
        this.itemOrdenRepository = itemOrdenRepository;
        this.ordenDeTrabajoRepository = ordenDeTrabajoRepository;
        this.productoService = productoService;
        this.movimientoInventarioService = movimientoInventarioService;
        this.facturaRepository = facturaRepository;
    }

    public List<ItemOrden> listarPorOrden(Long ordenId) {
        obtenerOrden(ordenId);
        return itemOrdenRepository.findByOrdenId(ordenId);
    }

    @Transactional
    public ItemOrden crear(Long ordenId, ItemOrden item) {
        OrdenDeTrabajo orden = obtenerOrdenNoFacturada(ordenId);
        item.setId(null);
        item.setOrden(orden);

        if (item.getTipo() == TipoItem.REPUESTO) {
            if (item.getProducto() == null || item.getProducto().getId() == null) {
                throw new IllegalArgumentException("Debe indicar el producto para un item de tipo REPUESTO");
            }
            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
            }
            Producto producto = productoService.obtener(item.getProducto().getId());
            item.setProducto(producto);
            item.setPrecioUnitario(producto.getPrecioVenta());
            item.setDescripcion(null);
            item.setProveedor(null);
            item.setCosto(null);

            productoService.descontarStock(producto.getId(), item.getCantidad());
            ItemOrden guardado = itemOrdenRepository.save(item);
            movimientoInventarioService.registrarSalidaPorItem(producto, item.getCantidad(), orden);
            return guardado;
        }

        if (item.getTipo() == TipoItem.REPUESTO_EXTERNO) {
            if (item.getDescripcion() == null || item.getDescripcion().isBlank()) {
                throw new IllegalArgumentException("Debe describir el repuesto externo");
            }
            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
            }
            if (item.getPrecioUnitario() == null || item.getPrecioUnitario().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("El precio unitario del repuesto externo debe ser mayor a cero");
            }
            item.setDescripcion(item.getDescripcion().trim());
            item.setProveedor(item.getProveedor() == null || item.getProveedor().isBlank()
                    ? null
                    : item.getProveedor().trim());
            item.setProducto(null);
            item.setCosto(null);
            return itemOrdenRepository.save(item);
        }

        if (item.getCosto() == null) {
            throw new IllegalArgumentException("Debe indicar el costo para un item de tipo MANO_DE_OBRA");
        }
        item.setProducto(null);
        item.setCantidad(null);
        item.setPrecioUnitario(null);
        item.setProveedor(null);
        return itemOrdenRepository.save(item);
    }

    @Transactional
    public void eliminar(Long ordenId, Long itemId) {
        OrdenDeTrabajo orden = obtenerOrdenNoFacturada(ordenId);
        ItemOrden item = itemOrdenRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado: " + itemId));
        if (!item.getOrden().getId().equals(ordenId)) {
            throw new ResourceNotFoundException("Item no encontrado en la orden " + ordenId);
        }
        if (item.getTipo() == TipoItem.REPUESTO) {
            productoService.reponerStock(item.getProducto().getId(), item.getCantidad());
            movimientoInventarioService.registrarEntradaPorReversion(item.getProducto(), item.getCantidad(), orden);
        }
        itemOrdenRepository.delete(item);
    }

    /** Una orden facturada queda cerrada: sus items ya están en los totales de la factura. */
    private OrdenDeTrabajo obtenerOrdenNoFacturada(Long ordenId) {
        OrdenDeTrabajo orden = obtenerOrden(ordenId);
        if (facturaRepository.findByOrdenId(ordenId).isPresent()) {
            throw new IllegalArgumentException("La orden " + ordenId + " ya está facturada; no se pueden modificar sus items");
        }
        return orden;
    }

    private OrdenDeTrabajo obtenerOrden(Long ordenId) {
        return ordenDeTrabajoRepository.findById(ordenId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de trabajo no encontrada: " + ordenId));
    }
}
