ALTER TABLE factura ADD COLUMN iva NUMERIC(19, 2);

UPDATE factura
SET iva = ROUND((subtotal_repuestos + subtotal_mano_obra) * 0.15, 2);

UPDATE factura
SET total = subtotal_repuestos + subtotal_mano_obra + iva;

ALTER TABLE factura ALTER COLUMN iva SET NOT NULL;
