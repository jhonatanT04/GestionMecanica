package mecanica.ec.cue.backend.service;

public class CredencialesInvalidasException extends RuntimeException {

    public CredencialesInvalidasException() {
        super("Credenciales invalidas");
    }
}
