package mecanica.ec.cue.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import mecanica.ec.cue.backend.model.Cliente;
import mecanica.ec.cue.backend.repository.ClienteRepository;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    ClienteRepository clienteRepository;

    @InjectMocks
    ClienteService service;

    private static Cliente cliente(String nombres, String apellidos, String cedula) {
        Cliente c = new Cliente();
        c.setNombres(nombres);
        c.setApellidos(apellidos);
        c.setCedula(cedula);
        return c;
    }

    @Test
    void creaElClienteNormalizandoNombresYCedula() {
        when(clienteRepository.existsByCedula("0912345675")).thenReturn(false);
        when(clienteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Cliente guardado = service.crear(cliente("  María   José ", " Guamán  Ortiz", "091234567-5"));

        assertThat(guardado.getNombres()).isEqualTo("María José");
        assertThat(guardado.getApellidos()).isEqualTo("Guamán Ortiz");
        assertThat(guardado.getCedula()).isEqualTo("0912345675");
        assertThat(guardado.getNombreCompleto()).isEqualTo("María José Guamán Ortiz");
    }

    @Test
    void exigeUnaCedulaValida() {
        assertThatThrownBy(() -> service.crear(cliente("Ana", "Ruiz", null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("obligatoria");
        assertThatThrownBy(() -> service.crear(cliente("Ana", "Ruiz", "0912345674")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("no es válida");
        verify(clienteRepository, never()).save(any());
    }

    @Test
    void noPermiteCedulasRepetidas() {
        when(clienteRepository.existsByCedula("0912345675")).thenReturn(true);
        assertThatThrownBy(() -> service.crear(cliente("Ana", "Ruiz", "0912345675")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Ya existe");

        Cliente existente = cliente("Ana", "Ruiz", null);
        existente.setId(5L);
        when(clienteRepository.findById(5L)).thenReturn(Optional.of(existente));
        when(clienteRepository.existsByCedulaAndIdNot("0102030400", 5L)).thenReturn(true);
        assertThatThrownBy(() -> service.actualizar(5L, cliente("Ana", "Ruiz", "0102030400")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("otro cliente");
        verify(clienteRepository, never()).save(any());
    }
}
