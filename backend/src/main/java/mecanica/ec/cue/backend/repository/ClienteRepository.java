package mecanica.ec.cue.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import mecanica.ec.cue.backend.model.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}
