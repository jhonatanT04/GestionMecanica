package mecanica.ec.cue.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import mecanica.ec.cue.backend.dto.LoginRequest;
import mecanica.ec.cue.backend.dto.LoginResponse;
import mecanica.ec.cue.backend.model.Usuario;
import mecanica.ec.cue.backend.repository.UsuarioRepository;
import mecanica.ec.cue.backend.security.JwtService;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPassword()))
                .orElseThrow(CredencialesInvalidasException::new);
        return new LoginResponse(jwtService.generarToken(usuario), usuario);
    }
}
