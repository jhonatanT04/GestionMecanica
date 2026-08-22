package mecanica.ec.cue.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import mecanica.ec.cue.backend.model.Vehiculo;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {

    Optional<Vehiculo> findByPlaca(String placa);
}
