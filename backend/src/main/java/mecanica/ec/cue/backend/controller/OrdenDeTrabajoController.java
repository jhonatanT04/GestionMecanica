package mecanica.ec.cue.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import mecanica.ec.cue.backend.model.OrdenDeTrabajo;
import mecanica.ec.cue.backend.service.OrdenDeTrabajoService;

@RestController
@RequestMapping("/api/ordenes")
public class OrdenDeTrabajoController {

    private final OrdenDeTrabajoService ordenService;

    public OrdenDeTrabajoController(OrdenDeTrabajoService ordenService) {
        this.ordenService = ordenService;
    }

    @GetMapping
    public List<OrdenDeTrabajo> listar() {
        return ordenService.listar();
    }

    @GetMapping("/{id}")
    public OrdenDeTrabajo obtener(@PathVariable Long id) {
        return ordenService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<OrdenDeTrabajo> crear(@Valid @RequestBody OrdenDeTrabajo orden) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ordenService.crear(orden));
    }

    @PutMapping("/{id}")
    public OrdenDeTrabajo actualizar(@PathVariable Long id, @Valid @RequestBody OrdenDeTrabajo orden) {
        return ordenService.actualizar(id, orden);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ordenService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
