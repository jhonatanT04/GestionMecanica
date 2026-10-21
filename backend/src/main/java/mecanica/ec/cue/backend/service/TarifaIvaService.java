package mecanica.ec.cue.backend.service;

import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import mecanica.ec.cue.backend.model.TarifaIva;
import mecanica.ec.cue.backend.repository.TarifaIvaRepository;

@Service
public class TarifaIvaService {

    private final TarifaIvaRepository tarifaIvaRepository;

    public TarifaIvaService(TarifaIvaRepository tarifaIvaRepository) {
        this.tarifaIvaRepository = tarifaIvaRepository;
    }

    public TarifaIva vigenteEn(LocalDate fecha) {
        return tarifaIvaRepository.findFirstByVigenteDesdeLessThanEqualOrderByVigenteDesdeDesc(fecha)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No hay una tarifa de IVA vigente para " + fecha + "; regístrela en Configuración"));
    }

    public TarifaIva vigenteHoy() {
        return vigenteEn(LocalDate.now());
    }

    public List<TarifaIva> listar() {
        return tarifaIvaRepository.findAllByOrderByVigenteDesdeDesc();
    }

    /**
     * Registra una nueva tarifa. Puede regir desde hoy o desde una fecha futura
     * (cuando el cambio de ley ya se conoce); no se aceptan fechas pasadas para no
     * alterar el criterio con el que se emitieron facturas anteriores.
     */
    public TarifaIva registrar(TarifaIva tarifa) {
        if (tarifa.getVigenteDesde().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La nueva tarifa no puede regir desde una fecha pasada");
        }
        if (tarifaIvaRepository.existsByVigenteDesde(tarifa.getVigenteDesde())) {
            throw new IllegalArgumentException(
                    "Ya hay una tarifa que rige desde " + tarifa.getVigenteDesde() + "; elimínela primero");
        }
        tarifa.setId(null);
        tarifa.setPorcentaje(tarifa.getPorcentaje().setScale(2, RoundingMode.HALF_UP));
        tarifa.setRegistradaEn(LocalDateTime.now());
        return tarifaIvaRepository.save(tarifa);
    }

    /** Solo se eliminan tarifas programadas (que todavía no empiezan a regir). */
    public void eliminar(Long id) {
        TarifaIva tarifa = tarifaIvaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarifa de IVA no encontrada: " + id));
        if (!tarifa.getVigenteDesde().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Solo se pueden eliminar tarifas programadas; las que ya rigen quedan en el historial");
        }
        tarifaIvaRepository.delete(tarifa);
    }
}
