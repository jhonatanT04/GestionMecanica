package mecanica.ec.cue.backend.dto;

import mecanica.ec.cue.backend.model.Usuario;

public class LoginResponse {

    private final String token;
    private final Usuario usuario;

    public LoginResponse(String token, Usuario usuario) {
        this.token = token;
        this.usuario = usuario;
    }

    public String getToken() {
        return token;
    }

    public Usuario getUsuario() {
        return usuario;
    }
}
