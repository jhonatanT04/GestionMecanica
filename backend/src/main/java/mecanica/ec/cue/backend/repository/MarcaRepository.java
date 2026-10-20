package mecanica.ec.cue.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import mecanica.ec.cue.backend.model.Marca;

public interface MarcaRepository extends JpaRepository<Marca, Long> {

    List<Marca> findAllByOrderByNombreAsc();

    List<Marca> findByActivaTrueOrderByNombreAsc();
}
