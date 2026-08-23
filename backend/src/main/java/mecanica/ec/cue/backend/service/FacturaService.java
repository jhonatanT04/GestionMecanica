package mecanica.ec.cue.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mecanica.ec.cue.backend.model.EstadoFactura;
import mecanica.ec.cue.backend.model.Factura;
import mecanica.ec.cue.backend.model.ItemOrden;
import mecanica.ec.cue.backend.model.OrdenDeTrabajo;
import mecanica.ec.cue.backend.model.TipoItem;
import mecanica.ec.cue.backend.repository.FacturaRepository;
import mecanica.ec.cue.backend.repository.ItemOrdenRepository;
import mecanica.ec.cue.backend.repository.OrdenDeTrabajoRepository;

@Service
public class FacturaService {

    /** Tarifa de IVA vigente en Ecuador. Único lugar a actualizar ante una futura reforma tributaria. */
    private static final BigDecimal PORCENTAJE_IVA = new BigDecimal("0.15");

    private final FacturaRepository facturaRepository;
    private final OrdenDeTrabajoRepository ordenDeTrabajoRepository;
    private final ItemOrdenRepository itemOrdenRepository;

    public FacturaService(FacturaRepository facturaRepository, OrdenDeTrabajoRepository ordenDeTrabajoRepository,
            ItemOrdenRepository itemOrdenRepository) {
        this.facturaRepository = facturaRepository;
        this.ordenDeTrabajoRepository = ordenDeTrabajoRepository;
        this.itemOrdenRepository = itemOrdenRepository;
    }

    @Transactional
    public Factura generar(Long ordenId) {
        OrdenDeTrabajo orden = ordenDeTrabajoRepository.findById(ordenId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de trabajo no encontrada: " + ordenId));
        if (facturaRepository.findByOrdenId(ordenId).isPresent()) {
            throw new IllegalArgumentException("La orden " + ordenId + " ya tiene una factura generada");
        }

        List<ItemOrden> items = itemOrdenRepository.findByOrdenId(ordenId);

        BigDecimal subtotalRepuestos = items.stream()
                .filter(item -> item.getTipo() == TipoItem.REPUESTO)
                .map(item -> item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal subtotalManoObra = items.stream()
                .filter(item -> item.getTipo() == TipoItem.MANO_DE_OBRA)
                .map(ItemOrden::getCosto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal subtotal = subtotalRepuestos.add(subtotalManoObra);
        BigDecimal iva = subtotal.multiply(PORCENTAJE_IVA).setScale(2, RoundingMode.HALF_UP);

        Factura factura = new Factura();
        factura.setNumero(generarNumero());
        factura.setFecha(LocalDate.now());
        factura.setOrden(orden);
        factura.setSubtotalRepuestos(subtotalRepuestos);
        factura.setSubtotalManoObra(subtotalManoObra);
        factura.setIva(iva);
        factura.setTotal(subtotal.add(iva));
        factura.setEstado(EstadoFactura.PENDIENTE);
        return facturaRepository.save(factura);
    }

    public List<Factura> listar() {
        return facturaRepository.findAll();
    }

    public Factura obtener(Long id) {
        return facturaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada: " + id));
    }

    public Factura marcarComoPagada(Long id) {
        Factura factura = obtener(id);
        factura.setEstado(EstadoFactura.PAGADA);
        return facturaRepository.save(factura);
    }

    private String generarNumero() {
        long siguiente = facturaRepository.count() + 1;
        return String.format("FAC-%06d", siguiente);
    }
}
