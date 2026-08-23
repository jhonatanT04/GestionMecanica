package mecanica.ec.cue.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mecanica.ec.cue.backend.model.ItemOrden;
import mecanica.ec.cue.backend.model.OrdenDeTrabajo;
import mecanica.ec.cue.backend.model.Producto;
import mecanica.ec.cue.backend.model.TipoItem;
import mecanica.ec.cue.backend.repository.ItemOrdenRepository;
import mecanica.ec.cue.backend.repository.OrdenDeTrabajoRepository;

@Service
public class ItemOrdenService {

    private final ItemOrdenRepository itemOrdenRepository;
    private final OrdenDeTrabajoRepository ordenDeTrabajoRepository;
    private final ProductoService productoService;
    private final MovimientoInventarioService movimientoInventarioService;

    public ItemOrdenService(ItemOrdenRepository itemOrdenRepository, OrdenDeTrabajoRepository ordenDeTrabajoRepository,
            ProductoService productoService, MovimientoInventarioService movimientoInventarioService) {
        this.itemOrdenRepository = itemOrdenRepository;
        this.ordenDeTrabajoRepository = ordenDeTrabajoRepository;
        this.productoService = productoService;
        this.movimientoInventarioService = movimientoInventarioService;
    }

    public List<ItemOrden> listarPorOrden(Long ordenId) {
        obtenerOrden(ordenId);
        return itemOrdenRepository.findByOrdenId(ordenId);
    }

    @Transactional
    public ItemOrden crear(Long ordenId, ItemOrden item) {
        OrdenDeTrabajo orden = obtenerOrden(ordenId);
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
            item.setCosto(null);

            productoService.descontarStock(producto.getId(), item.getCantidad());
            ItemOrden guardado = itemOrdenRepository.save(item);
            movimientoInventarioService.registrarSalidaPorItem(producto, item.getCantidad(), orden);
            return guardado;
        }

        if (item.getCosto() == null) {
            throw new IllegalArgumentException("Debe indicar el costo para un item de tipo MANO_DE_OBRA");
        }
        item.setProducto(null);
        item.setCantidad(null);
        item.setPrecioUnitario(null);
        return itemOrdenRepository.save(item);
    }

    @Transactional
    public void eliminar(Long ordenId, Long itemId) {
        OrdenDeTrabajo orden = obtenerOrden(ordenId);
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

    private OrdenDeTrabajo obtenerOrden(Long ordenId) {
        return ordenDeTrabajoRepository.findById(ordenId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de trabajo no encontrada: " + ordenId));
    }
}
