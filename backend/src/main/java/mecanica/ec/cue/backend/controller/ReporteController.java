package mecanica.ec.cue.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import mecanica.ec.cue.backend.dto.ReporteFacturacionMecanico;
import mecanica.ec.cue.backend.dto.ReporteFacturacionMensual;
import mecanica.ec.cue.backend.service.ReporteFacturacionService;

@RestController
@RequestMapping("/api/reportes/facturacion")
public class ReporteController {

    private final ReporteFacturacionService reporteFacturacionService;

    public ReporteController(ReporteFacturacionService reporteFacturacionService) {
        this.reporteFacturacionService = reporteFacturacionService;
    }

    @GetMapping("/por-mes")
    public List<ReporteFacturacionMensual> porMes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return reporteFacturacionService.porMes(desde, hasta);
    }

    @GetMapping("/por-mecanico")
    public List<ReporteFacturacionMecanico> porMecanico(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return reporteFacturacionService.porMecanico(desde, hasta);
    }
}
