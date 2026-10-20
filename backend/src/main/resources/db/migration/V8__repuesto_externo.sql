-- Repuestos comprados fuera del taller (TipoItem.REPUESTO_EXTERNO): se
-- registran en la orden/factura con su proveedor, sin tocar el inventario.
ALTER TABLE item_orden ADD COLUMN proveedor VARCHAR(255);
