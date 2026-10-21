package mecanica.ec.cue.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import mecanica.ec.cue.backend.model.TarifaIva;

public interface TarifaIvaRepository extends JpaRepository<TarifaIva, Long> {

    /** La tarifa que rige en {@code fecha}: la más reciente que ya empezó. */
    Optional<TarifaIva> findFirstByVigenteDesdeLessThanEqualOrderByVigenteDesdeDesc(LocalDate fecha);

    List<TarifaIva> findAllByOrderByVigenteDesdeDesc();

    boolean existsByVigenteDesde(LocalDate vigenteDesde);
}
