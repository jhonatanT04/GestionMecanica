-- La mano de obra ahora se registra como cantidad x precio unitario (igual que
-- REPUESTO_EXTERNO); costo queda como el subtotal calculado. Los items previos
-- solo tenian costo: se interpretan como 1 x costo.
UPDATE item_orden
SET cantidad = 1,
    precio_unitario = costo
WHERE tipo = 'MANO_DE_OBRA'
  AND cantidad IS NULL;
