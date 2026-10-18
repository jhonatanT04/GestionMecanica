import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Pasos del registro de llegada. Se muestran como una fila de chips con
/// icono (al estilo de los modos Auto/Cool/Fan/Heat de la referencia): el
/// paso actual va en azul lleno, los completados con contorno azul.
enum PasoRegistro { cliente, vehiculo, orden }

class FlowSteps extends StatelessWidget implements PreferredSizeWidget {
  final PasoRegistro actual;

  const FlowSteps({super.key, required this.actual});

  static const _pasos = [
    (PasoRegistro.cliente, Icons.person_outline, 'Cliente'),
    (PasoRegistro.vehiculo, Icons.directions_car_outlined, 'Vehículo'),
    (PasoRegistro.orden, Icons.build_outlined, 'Orden'),
  ];

  @override
  Size get preferredSize => const Size.fromHeight(76);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 4, 24, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          for (final (i, paso) in _pasos.indexed) ...[
            if (i > 0)
              Container(
                width: 28,
                height: 1,
                margin: const EdgeInsets.only(bottom: 20),
                color: paso.$1.index <= actual.index
                    ? AppColors.accentBright
                    : AppColors.border,
              ),
            _Chip(
              icon: paso.$2,
              label: paso.$3,
              activo: paso.$1 == actual,
              completado: paso.$1.index < actual.index,
            ),
          ],
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool activo;
  final bool completado;

  const _Chip({
    required this.icon,
    required this.label,
    required this.activo,
    required this.completado,
  });

  @override
  Widget build(BuildContext context) {
    final Color fondo = activo ? AppColors.accent : AppColors.surface;
    final Color borde = activo || completado
        ? AppColors.accentBright
        : AppColors.border;
    final Color icono = activo
        ? Colors.white
        : (completado ? AppColors.accentBright : AppColors.textMuted);

    return Semantics(
      label:
          '$label${activo
              ? ', paso actual'
              : completado
              ? ', completado'
              : ''}',
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: fondo,
              shape: BoxShape.circle,
              border: Border.all(color: borde),
            ),
            child: Icon(
              completado ? Icons.check : icon,
              size: 20,
              color: icono,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: activo ? FontWeight.w600 : FontWeight.w400,
              color: activo ? AppColors.text : AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}
