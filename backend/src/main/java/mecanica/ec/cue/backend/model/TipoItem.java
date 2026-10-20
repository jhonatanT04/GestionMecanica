package mecanica.ec.cue.backend.model;

public enum TipoItem {
    /** Repuesto del inventario del taller: descuenta stock. */
    REPUESTO,
    /** Repuesto comprado fuera del taller: se factura sin pasar por el inventario. */
    REPUESTO_EXTERNO,
    MANO_DE_OBRA
}
