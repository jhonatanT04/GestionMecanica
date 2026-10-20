import 'estado_orden.dart';
import 'orden_de_trabajo.dart';

/// Lo que está pasando ahora en el taller, calculado a partir de las
/// órdenes. "En el taller" = toda orden que todavía no se entregó.
class ResumenTaller {
  /// Órdenes abiertas, primero las atrasadas y luego por antigüedad.
  final List<OrdenDeTrabajo> enTaller;
  final Map<EstadoOrden, int> porEstado;
  final int atrasadas;
  final int ingresosHoy;

  const ResumenTaller._({
    required this.enTaller,
    required this.porEstado,
    required this.atrasadas,
    required this.ingresosHoy,
  });

  static const estadosAbiertos = [
    EstadoOrden.recibido,
    EstadoOrden.enDiagnostico,
    EstadoOrden.enReparacion,
    EstadoOrden.listo,
  ];

  int get listas => porEstado[EstadoOrden.listo] ?? 0;

  factory ResumenTaller.desde(List<OrdenDeTrabajo> ordenes, DateTime ahora) {
    final hoy = DateTime(ahora.year, ahora.month, ahora.day);
    final abiertas =
        ordenes.where((o) => o.estado != EstadoOrden.entregado).toList()
          ..sort((a, b) {
            final atrasoA = estaAtrasada(a, hoy) ? 0 : 1;
            final atrasoB = estaAtrasada(b, hoy) ? 0 : 1;
            if (atrasoA != atrasoB) return atrasoA - atrasoB;
            return a.fechaEntrada.compareTo(b.fechaEntrada);
          });

    return ResumenTaller._(
      enTaller: abiertas,
      porEstado: {
        for (final e in estadosAbiertos)
          e: abiertas.where((o) => o.estado == e).length,
      },
      atrasadas: abiertas.where((o) => estaAtrasada(o, hoy)).length,
      ingresosHoy: ordenes.where((o) => o.fechaEntrada == hoy).length,
    );
  }

  /// Pasó la fecha estimada de salida y el auto aún no está listo.
  static bool estaAtrasada(OrdenDeTrabajo o, DateTime hoy) {
    final estimada = o.fechaEstimadaSalida;
    return estimada != null &&
        estimada.isBefore(hoy) &&
        o.estado != EstadoOrden.listo &&
        o.estado != EstadoOrden.entregado;
  }

  static int diasEnTaller(OrdenDeTrabajo o, DateTime hoy) =>
      hoy.difference(o.fechaEntrada).inDays;
}
