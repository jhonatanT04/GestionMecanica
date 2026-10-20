package mecanica.ec.cue.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
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
import mecanica.ec.cue.backend.model.TipoItem;
import mecanica.ec.cue.backend.repository.FacturaRepository;
import mecanica.ec.cue.backend.repository.ItemOrdenRepository;
import mecanica.ec.cue.backend.repository.OrdenDeTrabajoRepository;

@ExtendWith(MockitoExtension.class)
class FacturaServiceTest {

    @Mock
    FacturaRepository facturaRepository;
    @Mock
    OrdenDeTrabajoRepository ordenDeTrabajoRepository;
    @Mock
    ItemOrdenRepository itemOrdenRepository;

    @InjectMocks
    FacturaService service;

    @BeforeEach
    void setUp() {
        OrdenDeTrabajo orden = new OrdenDeTrabajo();
        orden.setId(7L);
        when(ordenDeTrabajoRepository.findById(7L)).thenReturn(Optional.of(orden));
        when(facturaRepository.findByOrdenId(7L)).thenReturn(Optional.empty());
    }

    private static ItemOrden repuesto(TipoItem tipo, int cantidad, String precio) {
        ItemOrden item = new ItemOrden();
        item.setTipo(tipo);
        item.setCantidad(cantidad);
        item.setPrecioUnitario(new BigDecimal(precio));
        return item;
    }

    private static ItemOrden manoDeObra(String costo) {
        ItemOrden item = new ItemOrden();
        item.setTipo(TipoItem.MANO_DE_OBRA);
        item.setCosto(new BigDecimal(costo));
        return item;
    }

    @Test
    void losRepuestosExternosSumanAlSubtotalDeRepuestos() {
        when(itemOrdenRepository.findByOrdenId(7L)).thenReturn(List.of(
                repuesto(TipoItem.REPUESTO, 2, "10.00"),
                repuesto(TipoItem.REPUESTO_EXTERNO, 3, "15.50"),
                manoDeObra("40.00")));
        when(facturaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Factura factura = service.generar(7L);

        assertThat(factura.getSubtotalRepuestos()).isEqualByComparingTo("66.50");
        assertThat(factura.getSubtotalManoObra()).isEqualByComparingTo("40.00");
        assertThat(factura.getIva()).isEqualByComparingTo("15.98");
        assertThat(factura.getTotal()).isEqualByComparingTo("122.48");
    }

    @Test
    void noSeFacturaUnaOrdenSinItems() {
        when(itemOrdenRepository.findByOrdenId(7L)).thenReturn(List.of());

        assertThatThrownBy(() -> service.generar(7L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("no tiene items");
        verify(facturaRepository, never()).save(any());
    }
}
