package mecanica.ec.cue.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import mecanica.ec.cue.backend.model.Rol;
import mecanica.ec.cue.backend.model.Usuario;
import mecanica.ec.cue.backend.repository.UsuarioRepository;

@Component
public class UsuarioBootstrapRunner implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String bootstrapEmail;
    private final String bootstrapPassword;

    public UsuarioBootstrapRunner(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
            @Value("${bootstrap.admin.email:}") String bootstrapEmail,
            @Value("${bootstrap.admin.password:}") String bootstrapPassword) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.bootstrapEmail = bootstrapEmail;
        this.bootstrapPassword = bootstrapPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (usuarioRepository.count() > 0) {
            return;
        }
        if (bootstrapEmail.isBlank() || bootstrapPassword.isBlank()) {
            return;
        }
        Usuario admin = new Usuario();
        admin.setNombre("Administrador");
        admin.setEmail(bootstrapEmail);
        admin.setPassword(passwordEncoder.encode(bootstrapPassword));
        admin.setRol(Rol.DUENO);
        usuarioRepository.save(admin);
    }
}
