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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import mecanica.ec.cue.backend.model.Marca;
import mecanica.ec.cue.backend.service.MarcaService;

@RestController
@RequestMapping("/api/marcas")
public class MarcaController {

    private final MarcaService marcaService;

    public MarcaController(MarcaService marcaService) {
        this.marcaService = marcaService;
    }

    @GetMapping
    public List<Marca> listar(@RequestParam(required = false) Boolean activas) {
        return marcaService.listar(activas);
    }

    @GetMapping("/{id}")
    public Marca obtener(@PathVariable Long id) {
        return marcaService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<Marca> crear(@Valid @RequestBody Marca marca) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marcaService.crear(marca));
    }

    @PutMapping("/{id}")
    public Marca actualizar(@PathVariable Long id, @Valid @RequestBody Marca marca) {
        return marcaService.actualizar(id, marca);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        marcaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
