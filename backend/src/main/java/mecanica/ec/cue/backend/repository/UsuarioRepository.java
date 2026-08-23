package mecanica.ec.cue.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import mecanica.ec.cue.backend.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);
}
