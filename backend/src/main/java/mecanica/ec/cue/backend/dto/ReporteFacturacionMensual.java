package mecanica.ec.cue.backend.dto;

import java.math.BigDecimal;

public class ReporteFacturacionMensual {

    private final int anio;
    private final int mes;
    private final BigDecimal totalFacturado;
    private final long cantidadFacturas;

    public ReporteFacturacionMensual(int anio, int mes, BigDecimal totalFacturado, long cantidadFacturas) {
        this.anio = anio;
        this.mes = mes;
        this.totalFacturado = totalFacturado;
        this.cantidadFacturas = cantidadFacturas;
    }

    public int getAnio() {
        return anio;
    }

    public int getMes() {
        return mes;
    }

    public BigDecimal getTotalFacturado() {
        return totalFacturado;
    }

    public long getCantidadFacturas() {
        return cantidadFacturas;
    }
}
