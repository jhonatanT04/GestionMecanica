package mecanica.ec.cue.backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import mecanica.ec.cue.backend.dto.ReporteFacturacionMecanico;
import mecanica.ec.cue.backend.dto.ReporteFacturacionMensual;
import mecanica.ec.cue.backend.model.EstadoFactura;
import mecanica.ec.cue.backend.model.Factura;
import mecanica.ec.cue.backend.model.Usuario;
import mecanica.ec.cue.backend.repository.FacturaRepository;

@Service
public class ReporteFacturacionService {

    private final FacturaRepository facturaRepository;

    public ReporteFacturacionService(FacturaRepository facturaRepository) {
        this.facturaRepository = facturaRepository;
    }

    public List<ReporteFacturacionMensual> porMes(LocalDate desde, LocalDate hasta) {
        Map<YearMonth, List<Factura>> agrupado = pagadasEnRango(desde, hasta).stream()
                .collect(Collectors.groupingBy(f -> YearMonth.from(f.getFechaPago())));

        return agrupado.entrySet().stream()
                .map(e -> new ReporteFacturacionMensual(
                        e.getKey().getYear(),
                        e.getKey().getMonthValue(),
                        sumarTotales(e.getValue()),
                        e.getValue().size()))
                .sorted(Comparator.comparing(ReporteFacturacionMensual::getAnio)
                        .thenComparing(ReporteFacturacionMensual::getMes))
                .toList();
    }

    /** Collectors.groupingBy no admite claves null; se usa como marcador de "sin mecanico asignado". */
    private static final Long SIN_ASIGNAR = 0L;

    public List<ReporteFacturacionMecanico> porMecanico(LocalDate desde, LocalDate hasta) {
        Map<Long, List<Factura>> agrupado = pagadasEnRango(desde, hasta).stream()
                .collect(Collectors.groupingBy(f -> {
                    Usuario mecanico = f.getOrden().getMecanicoAsignado();
                    return mecanico == null ? SIN_ASIGNAR : mecanico.getId();
                }));

        return agrupado.entrySet().stream()
                .map(e -> {
                    boolean sinAsignar = e.getKey().equals(SIN_ASIGNAR);
                    Long mecanicoId = sinAsignar ? null : e.getKey();
                    String nombre = sinAsignar ? "Sin asignar"
                            : e.getValue().get(0).getOrden().getMecanicoAsignado().getNombre();
                    return new ReporteFacturacionMecanico(mecanicoId, nombre, sumarTotales(e.getValue()),
                            e.getValue().size());
                })
                .sorted(Comparator.comparing(ReporteFacturacionMecanico::getTotalFacturado).reversed())
                .toList();
    }

    private List<Factura> pagadasEnRango(LocalDate desde, LocalDate hasta) {
        return facturaRepository.findByEstado(EstadoFactura.PAGADA).stream()
                .filter(f -> desde == null || !f.getFechaPago().isBefore(desde))
                .filter(f -> hasta == null || !f.getFechaPago().isAfter(hasta))
                .toList();
    }

    private static BigDecimal sumarTotales(List<Factura> facturas) {
        return facturas.stream().map(Factura::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
