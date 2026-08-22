package mecanica.ec.cue.backend.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;

@Entity
public class OrdenDeTrabajo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private LocalDate fechaEntrada;

    private LocalDate fechaEstimadaSalida;

    private LocalDate fechaRealSalida;

    private Integer kilometrajeIngreso;

    private String problemaReportado;

    private String diagnostico;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoOrden estado = EstadoOrden.RECIBIDO;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "mecanico_asignado_id")
    private Usuario mecanicoAsignado;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getFechaEntrada() {
        return fechaEntrada;
    }

    public void setFechaEntrada(LocalDate fechaEntrada) {
        this.fechaEntrada = fechaEntrada;
    }

    public LocalDate getFechaEstimadaSalida() {
        return fechaEstimadaSalida;
    }

    public void setFechaEstimadaSalida(LocalDate fechaEstimadaSalida) {
        this.fechaEstimadaSalida = fechaEstimadaSalida;
    }

    public LocalDate getFechaRealSalida() {
        return fechaRealSalida;
    }

    public void setFechaRealSalida(LocalDate fechaRealSalida) {
        this.fechaRealSalida = fechaRealSalida;
    }

    public Integer getKilometrajeIngreso() {
        return kilometrajeIngreso;
    }

    public void setKilometrajeIngreso(Integer kilometrajeIngreso) {
        this.kilometrajeIngreso = kilometrajeIngreso;
    }

    public String getProblemaReportado() {
        return problemaReportado;
    }

    public void setProblemaReportado(String problemaReportado) {
        this.problemaReportado = problemaReportado;
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

    public EstadoOrden getEstado() {
        return estado;
    }

    public void setEstado(EstadoOrden estado) {
        this.estado = estado;
    }

    public Vehiculo getVehiculo() {
        return vehiculo;
    }

    public void setVehiculo(Vehiculo vehiculo) {
        this.vehiculo = vehiculo;
    }

    public Usuario getMecanicoAsignado() {
        return mecanicoAsignado;
    }

    public void setMecanicoAsignado(Usuario mecanicoAsignado) {
        this.mecanicoAsignado = mecanicoAsignado;
    }
}
