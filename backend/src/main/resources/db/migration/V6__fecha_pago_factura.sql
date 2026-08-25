ALTER TABLE factura ADD COLUMN fecha_pago DATE;

UPDATE factura SET fecha_pago = fecha WHERE estado = 'PAGADA' AND fecha_pago IS NULL;
