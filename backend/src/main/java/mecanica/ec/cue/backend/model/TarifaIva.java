package mecanica.ec.cue.backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/** Porcentaje de IVA que rige desde {@code vigenteDesde} hasta la siguiente tarifa. */
@Entity
public class TarifaIva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** En puntos porcentuales: 15.00 significa 15%. */
    @NotNull
    @DecimalMin(value = "0.00")
    @DecimalMax(value = "100.00", inclusive = false)
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentaje;

    @NotNull
    @Column(nullable = false, unique = true)
    private LocalDate vigenteDesde;

    @Column(nullable = false)
    private LocalDateTime registradaEn;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getPorcentaje() {
        return porcentaje;
    }

    public void setPorcentaje(BigDecimal porcentaje) {
        this.porcentaje = porcentaje;
    }

    public LocalDate getVigenteDesde() {
        return vigenteDesde;
    }

    public void setVigenteDesde(LocalDate vigenteDesde) {
        this.vigenteDesde = vigenteDesde;
    }

    public LocalDateTime getRegistradaEn() {
        return registradaEn;
    }

    public void setRegistradaEn(LocalDateTime registradaEn) {
        this.registradaEn = registradaEn;
    }
}
