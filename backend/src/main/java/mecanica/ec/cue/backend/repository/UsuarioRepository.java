package mecanica.ec.cue.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import mecanica.ec.cue.backend.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}
