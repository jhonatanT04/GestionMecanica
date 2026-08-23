package mecanica.ec.cue.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import mecanica.ec.cue.backend.model.MovimientoInventario;
import mecanica.ec.cue.backend.service.MovimientoInventarioService;

@RestController
@RequestMapping("/api/movimientos-inventario")
public class MovimientoInventarioController {

    private final MovimientoInventarioService movimientoInventarioService;

    public MovimientoInventarioController(MovimientoInventarioService movimientoInventarioService) {
        this.movimientoInventarioService = movimientoInventarioService;
    }

    @GetMapping
    public List<MovimientoInventario> listar(@RequestParam(required = false) Long productoId) {
        return movimientoInventarioService.listar(productoId);
    }

    @PostMapping
    public ResponseEntity<MovimientoInventario> crear(@Valid @RequestBody MovimientoInventario movimiento) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(movimientoInventarioService.registrarEntradaManual(movimiento));
    }
}
