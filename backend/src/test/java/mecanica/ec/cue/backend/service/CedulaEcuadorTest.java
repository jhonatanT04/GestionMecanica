package mecanica.ec.cue.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

class CedulaEcuadorTest {

    // Números sintéticos construidos con el algoritmo; no corresponden a personas.
    @ParameterizedTest
    @ValueSource(strings = { "0102030400", "1700000001", "0912345675", "3000000012" })
    void aceptaCedulasConDigitoVerificadorCorrecto(String cedula) {
        assertThat(CedulaEcuador.esValida(cedula)).isTrue();
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {
            "0912345674", // dígito verificador incorrecto
            "2500000000", // provincia inexistente
            "0172345678", // tercer dígito >= 6
            "091234567", // 9 dígitos
            "09123456751", // 11 dígitos
            "09123A5675" // con letras
    })
    void rechazaCedulasInvalidas(String cedula) {
        assertThat(CedulaEcuador.esValida(cedula)).isFalse();
    }
}
