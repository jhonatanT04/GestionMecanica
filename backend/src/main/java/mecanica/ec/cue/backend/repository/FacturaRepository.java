package mecanica.ec.cue.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import mecanica.ec.cue.backend.model.EstadoFactura;
import mecanica.ec.cue.backend.model.Factura;

public interface FacturaRepository extends JpaRepository<Factura, Long> {

    Optional<Factura> findByOrdenId(Long ordenId);

    List<Factura> findByEstado(EstadoFactura estado);
}
