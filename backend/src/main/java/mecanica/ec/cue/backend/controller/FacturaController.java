package mecanica.ec.cue.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import mecanica.ec.cue.backend.model.Factura;
import mecanica.ec.cue.backend.service.FacturaService;

@RestController
public class FacturaController {

    private final FacturaService facturaService;

    public FacturaController(FacturaService facturaService) {
        this.facturaService = facturaService;
    }

    @PostMapping("/api/ordenes/{ordenId}/factura")
    public ResponseEntity<Factura> generar(@PathVariable Long ordenId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facturaService.generar(ordenId));
    }

    @GetMapping("/api/facturas")
    public List<Factura> listar() {
        return facturaService.listar();
    }

    @GetMapping("/api/facturas/{id}")
    public Factura obtener(@PathVariable Long id) {
        return facturaService.obtener(id);
    }

    @PatchMapping("/api/facturas/{id}/pagar")
    public Factura pagar(@PathVariable Long id) {
        return facturaService.marcarComoPagada(id);
    }
}
