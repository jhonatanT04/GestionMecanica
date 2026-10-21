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

    private final FacturaRepository facturaRepository;
    private final OrdenDeTrabajoRepository ordenDeTrabajoRepository;
    private final ItemOrdenRepository itemOrdenRepository;
    private final TarifaIvaService tarifaIvaService;

    public FacturaService(FacturaRepository facturaRepository, OrdenDeTrabajoRepository ordenDeTrabajoRepository,
            ItemOrdenRepository itemOrdenRepository, TarifaIvaService tarifaIvaService) {
        this.facturaRepository = facturaRepository;
        this.ordenDeTrabajoRepository = ordenDeTrabajoRepository;
        this.itemOrdenRepository = itemOrdenRepository;
        this.tarifaIvaService = tarifaIvaService;
    }

    @Transactional
    public Factura generar(Long ordenId) {
        OrdenDeTrabajo orden = ordenDeTrabajoRepository.findById(ordenId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de trabajo no encontrada: " + ordenId));
        if (facturaRepository.findByOrdenId(ordenId).isPresent()) {
            throw new IllegalArgumentException("La orden " + ordenId + " ya tiene una factura generada");
        }

        List<ItemOrden> items = itemOrdenRepository.findByOrdenId(ordenId);
        if (items.isEmpty()) {
            throw new IllegalArgumentException("La orden " + ordenId + " no tiene items para facturar");
        }

        LocalDate hoy = LocalDate.now();
        // La tarifa sale de Configuración (la que rige hoy), no del código.
        BigDecimal porcentajeIva = tarifaIvaService.vigenteEn(hoy).getPorcentaje();
        BigDecimal factorIva = BigDecimal.ONE.add(porcentajeIva.movePointLeft(2));

        // Los precios de los items ya incluyen IVA: el total es su suma y los
        // subtotales son la base imponible (precio / (1 + tarifa)). El IVA es la
        // diferencia, así subtotales + IVA cuadran exacto con el total.
        BigDecimal totalRepuestos = items.stream()
                .filter(item -> item.getTipo() == TipoItem.REPUESTO || item.getTipo() == TipoItem.REPUESTO_EXTERNO)
                .map(item -> item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalManoObra = items.stream()
                .filter(item -> item.getTipo() == TipoItem.MANO_DE_OBRA)
                .map(ItemOrden::getCosto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal total = totalRepuestos.add(totalManoObra).setScale(2, RoundingMode.HALF_UP);
        BigDecimal subtotalRepuestos = sinIva(totalRepuestos, factorIva);
        BigDecimal subtotalManoObra = sinIva(totalManoObra, factorIva);
        BigDecimal iva = total.subtract(subtotalRepuestos).subtract(subtotalManoObra);

        Factura factura = new Factura();
        factura.setNumero(generarNumero());
        factura.setFecha(hoy);
        factura.setOrden(orden);
        factura.setSubtotalRepuestos(subtotalRepuestos);
        factura.setSubtotalManoObra(subtotalManoObra);
        factura.setIva(iva);
        factura.setPorcentajeIva(porcentajeIva);
        factura.setTotal(total);
        factura.setEstado(EstadoFactura.PENDIENTE);
        return facturaRepository.save(factura);
    }

    public Factura obtenerPorOrden(Long ordenId) {
        return facturaRepository.findByOrdenId(ordenId)
                .orElseThrow(() -> new ResourceNotFoundException("La orden " + ordenId + " no tiene factura"));
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
        factura.setFechaPago(LocalDate.now());
        return facturaRepository.save(factura);
    }

    /** Base imponible de un monto que ya trae el IVA incluido. */
    private static BigDecimal sinIva(BigDecimal montoConIva, BigDecimal factorIva) {
        return montoConIva.divide(factorIva, 2, RoundingMode.HALF_UP);
    }

    private String generarNumero() {
        long siguiente = facturaRepository.count() + 1;
        return String.format("FAC-%06d", siguiente);
    }
}
