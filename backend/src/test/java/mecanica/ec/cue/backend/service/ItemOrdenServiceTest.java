package mecanica.ec.cue.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import mecanica.ec.cue.backend.model.Factura;
import mecanica.ec.cue.backend.model.ItemOrden;
import mecanica.ec.cue.backend.model.OrdenDeTrabajo;
import mecanica.ec.cue.backend.model.Producto;
import mecanica.ec.cue.backend.model.TipoItem;
import mecanica.ec.cue.backend.repository.FacturaRepository;
import mecanica.ec.cue.backend.repository.ItemOrdenRepository;
import mecanica.ec.cue.backend.repository.OrdenDeTrabajoRepository;

@ExtendWith(MockitoExtension.class)
class ItemOrdenServiceTest {

    @Mock
    ItemOrdenRepository itemOrdenRepository;
    @Mock
    OrdenDeTrabajoRepository ordenDeTrabajoRepository;
    @Mock
    ProductoService productoService;
    @Mock
    MovimientoInventarioService movimientoInventarioService;
    @Mock
    FacturaRepository facturaRepository;

    @InjectMocks
    ItemOrdenService service;

    OrdenDeTrabajo orden;

    @BeforeEach
    void setUp() {
        orden = new OrdenDeTrabajo();
        orden.setId(7L);
        when(ordenDeTrabajoRepository.findById(7L)).thenReturn(Optional.of(orden));
    }

    private ItemOrden externo(String descripcion, Integer cantidad, String precio) {
        ItemOrden item = new ItemOrden();
        item.setTipo(TipoItem.REPUESTO_EXTERNO);
        item.setDescripcion(descripcion);
        item.setProveedor("  Repuestos El Vergel  ");
        item.setCantidad(cantidad);
        item.setPrecioUnitario(precio == null ? null : new BigDecimal(precio));
        return item;
    }

    @Test
    void repuestoExternoSeGuardaSinTocarElInventario() {
        when(facturaRepository.findByOrdenId(7L)).thenReturn(Optional.empty());
        when(itemOrdenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ItemOrden item = externo("  Bomba de agua  ", 2, "45.50");
        item.setProducto(new Producto());
        item.setCosto(new BigDecimal("99"));

        ItemOrden guardado = service.crear(7L, item);

        assertThat(guardado.getOrden()).isSameAs(orden);
        assertThat(guardado.getDescripcion()).isEqualTo("Bomba de agua");
        assertThat(guardado.getProveedor()).isEqualTo("Repuestos El Vergel");
        assertThat(guardado.getProducto()).isNull();
        assertThat(guardado.getCosto()).isNull();
        verifyNoInteractions(productoService, movimientoInventarioService);
    }

    @Test
    void repuestoExternoExigeDescripcionCantidadYPrecio() {
        when(facturaRepository.findByOrdenId(7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.crear(7L, externo(" ", 1, "10")))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.crear(7L, externo("Filtro", 0, "10")))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.crear(7L, externo("Filtro", 1, "0")))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.crear(7L, externo("Filtro", 1, null)))
                .isInstanceOf(IllegalArgumentException.class);
        verify(itemOrdenRepository, never()).save(any());
    }

    @Test
    void noSePuedenAgregarItemsAUnaOrdenFacturada() {
        when(facturaRepository.findByOrdenId(7L)).thenReturn(Optional.of(new Factura()));

        assertThatThrownBy(() -> service.crear(7L, externo("Filtro", 1, "10")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("facturada");
        verify(itemOrdenRepository, never()).save(any());
        verify(productoService, never()).descontarStock(anyLong(), anyInt());
    }

    @Test
    void noSePuedenEliminarItemsDeUnaOrdenFacturada() {
        when(facturaRepository.findByOrdenId(7L)).thenReturn(Optional.of(new Factura()));

        assertThatThrownBy(() -> service.eliminar(7L, 3L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("facturada");
        verify(itemOrdenRepository, never()).delete(any());
    }
}
