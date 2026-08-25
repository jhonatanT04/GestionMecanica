package mecanica.ec.cue.backend.dto;

import java.math.BigDecimal;

public class ReporteFacturacionMecanico {

    private final Long mecanicoId;
    private final String mecanicoNombre;
    private final BigDecimal totalFacturado;
    private final long cantidadFacturas;

    public ReporteFacturacionMecanico(Long mecanicoId, String mecanicoNombre, BigDecimal totalFacturado,
            long cantidadFacturas) {
        this.mecanicoId = mecanicoId;
        this.mecanicoNombre = mecanicoNombre;
        this.totalFacturado = totalFacturado;
        this.cantidadFacturas = cantidadFacturas;
    }

    public Long getMecanicoId() {
        return mecanicoId;
    }

    public String getMecanicoNombre() {
        return mecanicoNombre;
    }

    public BigDecimal getTotalFacturado() {
        return totalFacturado;
    }

    public long getCantidadFacturas() {
        return cantidadFacturas;
    }
}
