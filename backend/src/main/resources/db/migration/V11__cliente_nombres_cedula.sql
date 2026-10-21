-- El cliente pasa de un único "nombre" a nombres + apellidos + cédula.
ALTER TABLE cliente ADD COLUMN nombres VARCHAR(255);
ALTER TABLE cliente ADD COLUMN apellidos VARCHAR(255);
ALTER TABLE cliente ADD COLUMN cedula VARCHAR(10);

-- Separa el nombre existente con el orden habitual en Ecuador
-- (nombres primero, luego los dos apellidos):
--   4+ palabras: todas menos las dos últimas son nombres
--   3 palabras:  1 nombre + 2 apellidos
--   2 palabras:  1 nombre + 1 apellido
--   1 palabra:   solo nombre (apellidos vacío, se completa al editar)
UPDATE cliente c
SET nombres = CASE
        WHEN cardinality(s.w) >= 4 THEN array_to_string(s.w[1:cardinality(s.w) - 2], ' ')
        ELSE s.w[1]
    END,
    apellidos = CASE
        WHEN cardinality(s.w) >= 3 THEN array_to_string(s.w[cardinality(s.w) - 1:cardinality(s.w)], ' ')
        WHEN cardinality(s.w) = 2 THEN s.w[2]
        ELSE ''
    END
FROM (SELECT id, regexp_split_to_array(btrim(nombre), '\s+') AS w FROM cliente) s
WHERE c.id = s.id;

ALTER TABLE cliente ALTER COLUMN nombres SET NOT NULL;
ALTER TABLE cliente ALTER COLUMN apellidos SET NOT NULL;
ALTER TABLE cliente DROP COLUMN nombre;

-- Los clientes previos no tienen cédula (queda NULL hasta que se los edite);
-- las que se registren no pueden repetirse.
CREATE UNIQUE INDEX uk_cliente_cedula ON cliente (cedula) WHERE cedula IS NOT NULL;
