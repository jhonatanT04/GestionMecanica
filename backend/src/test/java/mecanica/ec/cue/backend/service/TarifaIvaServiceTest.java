package mecanica.ec.cue.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import mecanica.ec.cue.backend.model.TarifaIva;
import mecanica.ec.cue.backend.repository.TarifaIvaRepository;

@ExtendWith(MockitoExtension.class)
class TarifaIvaServiceTest {

    @Mock
    TarifaIvaRepository tarifaIvaRepository;

    @InjectMocks
    TarifaIvaService service;

    private static TarifaIva tarifa(String porcentaje, LocalDate desde) {
        TarifaIva t = new TarifaIva();
        t.setPorcentaje(new BigDecimal(porcentaje));
        t.setVigenteDesde(desde);
        return t;
    }

    @Test
    void registraUnaTarifaProgramada() {
        LocalDate desde = LocalDate.now().plusMonths(1);
        when(tarifaIvaRepository.existsByVigenteDesde(desde)).thenReturn(false);
        when(tarifaIvaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TarifaIva guardada = service.registrar(tarifa("16", desde));

        assertThat(guardada.getPorcentaje()).isEqualByComparingTo("16.00");
        assertThat(guardada.getRegistradaEn()).isNotNull();
    }

    @Test
    void noAceptaFechasPasadasNiRepetidas() {
        assertThatThrownBy(() -> service.registrar(tarifa("16", LocalDate.now().minusDays(1))))
                .isInstanceOf(IllegalArgumentException.class);

        LocalDate hoy = LocalDate.now();
        when(tarifaIvaRepository.existsByVigenteDesde(hoy)).thenReturn(true);
        assertThatThrownBy(() -> service.registrar(tarifa("16", hoy)))
                .isInstanceOf(IllegalArgumentException.class);

        verify(tarifaIvaRepository, never()).save(any());
    }

    @Test
    void sinTarifaVigenteNoSePuedeFacturar() {
        when(tarifaIvaRepository.findFirstByVigenteDesdeLessThanEqualOrderByVigenteDesdeDesc(any()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.vigenteHoy())
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Configuración");
    }

    @Test
    void soloSeEliminanTarifasQueAunNoRigen() {
        TarifaIva vigente = tarifa("15", LocalDate.now());
        when(tarifaIvaRepository.findById(1L)).thenReturn(Optional.of(vigente));
        assertThatThrownBy(() -> service.eliminar(1L)).isInstanceOf(IllegalArgumentException.class);
        verify(tarifaIvaRepository, never()).delete(any());

        TarifaIva programada = tarifa("16", LocalDate.now().plusDays(10));
        when(tarifaIvaRepository.findById(2L)).thenReturn(Optional.of(programada));
        service.eliminar(2L);
        verify(tarifaIvaRepository).delete(programada);
    }
}
