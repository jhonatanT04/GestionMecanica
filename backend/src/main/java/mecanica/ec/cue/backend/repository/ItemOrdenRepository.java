package mecanica.ec.cue.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import mecanica.ec.cue.backend.model.ItemOrden;

public interface ItemOrdenRepository extends JpaRepository<ItemOrden, Long> {

    List<ItemOrden> findByOrdenId(Long ordenId);
}
