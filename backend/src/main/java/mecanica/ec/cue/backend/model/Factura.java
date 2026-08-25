package mecanica.ec.cue.backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String numero;

    @NotNull
    @Column(nullable = false)
    private LocalDate fecha;

    private LocalDate fechaPago;

    @NotNull
    @OneToOne
    @JoinColumn(name = "orden_id", nullable = false, unique = true)
    private OrdenDeTrabajo orden;

    @NotNull
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal subtotalRepuestos;

    @NotNull
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal subtotalManoObra;

    @NotNull
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal iva;

    @NotNull
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal total;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoFactura estado = EstadoFactura.PENDIENTE;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalDate getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDate fechaPago) {
        this.fechaPago = fechaPago;
    }

    public OrdenDeTrabajo getOrden() {
        return orden;
    }

    public void setOrden(OrdenDeTrabajo orden) {
        this.orden = orden;
    }

    public BigDecimal getSubtotalRepuestos() {
        return subtotalRepuestos;
    }

    public void setSubtotalRepuestos(BigDecimal subtotalRepuestos) {
        this.subtotalRepuestos = subtotalRepuestos;
    }

    public BigDecimal getSubtotalManoObra() {
        return subtotalManoObra;
    }

    public void setSubtotalManoObra(BigDecimal subtotalManoObra) {
        this.subtotalManoObra = subtotalManoObra;
    }

    public BigDecimal getIva() {
        return iva;
    }

    public void setIva(BigDecimal iva) {
        this.iva = iva;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public EstadoFactura getEstado() {
        return estado;
    }

    public void setEstado(EstadoFactura estado) {
        this.estado = estado;
    }
}
