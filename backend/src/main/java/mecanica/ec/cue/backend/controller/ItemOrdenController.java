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
import mecanica.ec.cue.backend.model.ItemOrden;
import mecanica.ec.cue.backend.service.ItemOrdenService;

@RestController
@RequestMapping("/api/ordenes/{ordenId}/items")
public class ItemOrdenController {

    private final ItemOrdenService itemOrdenService;

    public ItemOrdenController(ItemOrdenService itemOrdenService) {
        this.itemOrdenService = itemOrdenService;
    }

    @GetMapping
    public List<ItemOrden> listar(@PathVariable Long ordenId) {
        return itemOrdenService.listarPorOrden(ordenId);
    }

    @PostMapping
    public ResponseEntity<ItemOrden> crear(@PathVariable Long ordenId, @Valid @RequestBody ItemOrden item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(itemOrdenService.crear(ordenId, item));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> eliminar(@PathVariable Long ordenId, @PathVariable Long itemId) {
        itemOrdenService.eliminar(ordenId, itemId);
        return ResponseEntity.noContent().build();
    }
}
