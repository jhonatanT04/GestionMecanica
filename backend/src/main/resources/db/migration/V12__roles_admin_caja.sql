-- Los roles pasan a ser ADMIN, MECANICO y CAJA.
UPDATE usuario SET rol = 'ADMIN' WHERE rol = 'DUENO';
UPDATE usuario SET rol = 'CAJA' WHERE rol = 'RECEPCIONISTA';
