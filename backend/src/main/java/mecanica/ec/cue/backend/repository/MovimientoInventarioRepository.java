package mecanica.ec.cue.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import mecanica.ec.cue.backend.model.MovimientoInventario;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    List<MovimientoInventario> findByProductoId(Long productoId);
}
