package mecanica.ec.cue.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import mecanica.ec.cue.backend.model.TarifaIva;
import mecanica.ec.cue.backend.service.TarifaIvaService;

@RestController
@RequestMapping("/api/configuracion/iva")
public class TarifaIvaController {

    private final TarifaIvaService tarifaIvaService;

    public TarifaIvaController(TarifaIvaService tarifaIvaService) {
        this.tarifaIvaService = tarifaIvaService;
    }

    /** Tarifa que rige hoy (cualquier usuario: la usa la vista previa de la factura). */
    @GetMapping
    public TarifaIva vigente() {
        return tarifaIvaService.vigenteHoy();
    }

    @GetMapping("/historial")
    public List<TarifaIva> historial() {
        return tarifaIvaService.listar();
    }

    @PostMapping
    public ResponseEntity<TarifaIva> registrar(@Valid @RequestBody TarifaIva tarifa) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tarifaIvaService.registrar(tarifa));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        tarifaIvaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
