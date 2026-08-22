package mecanica.ec.cue.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import mecanica.ec.cue.backend.model.OrdenDeTrabajo;

public interface OrdenDeTrabajoRepository extends JpaRepository<OrdenDeTrabajo, Long> {
}
