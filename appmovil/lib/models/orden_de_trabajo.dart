import 'estado_orden.dart';
import 'usuario.dart';
import 'vehiculo.dart';

/// Parsea una fecha `LocalDate` del backend ("yyyy-MM-dd") sin pasar por
/// interpretación de zona horaria: solo nos interesa el día calendario.
DateTime _parseLocalDate(String value) {
  final parts = value.split('-');
  return DateTime(int.parse(parts[0]), int.parse(parts[1]), int.parse(parts[2]));
}

String formatLocalDate(DateTime date) {
  final y = date.year.toString().padLeft(4, '0');
  final m = date.month.toString().padLeft(2, '0');
  final d = date.day.toString().padLeft(2, '0');
  return '$y-$m-$d';
}

class OrdenDeTrabajo {
  final int? id;
  final DateTime fechaEntrada;
  final DateTime? fechaEstimadaSalida;
  final DateTime? fechaRealSalida;
  final int kilometrajeIngreso;
  final String problemaReportado;
  final String? diagnostico;
  final EstadoOrden estado;
  final Vehiculo vehiculo;
  final Usuario? mecanicoAsignado;

  const OrdenDeTrabajo({
    this.id,
    required this.fechaEntrada,
    this.fechaEstimadaSalida,
    this.fechaRealSalida,
    required this.kilometrajeIngreso,
    required this.problemaReportado,
    this.diagnostico,
    this.estado = EstadoOrden.recibido,
    required this.vehiculo,
    this.mecanicoAsignado,
  });

  factory OrdenDeTrabajo.fromJson(Map<String, dynamic> json) => OrdenDeTrabajo(
        id: json['id'] as int?,
        fechaEntrada: _parseLocalDate(json['fechaEntrada'] as String),
        fechaEstimadaSalida: (json['fechaEstimadaSalida'] as String?) != null
            ? _parseLocalDate(json['fechaEstimadaSalida'] as String)
            : null,
        fechaRealSalida: (json['fechaRealSalida'] as String?) != null
            ? _parseLocalDate(json['fechaRealSalida'] as String)
            : null,
        kilometrajeIngreso: json['kilometrajeIngreso'] as int? ?? 0,
        problemaReportado: json['problemaReportado'] as String? ?? '',
        diagnostico: json['diagnostico'] as String?,
        estado: EstadoOrdenJson.fromApiValue(json['estado'] as String? ?? 'RECIBIDO'),
        vehiculo: Vehiculo.fromJson(json['vehiculo'] as Map<String, dynamic>),
        mecanicoAsignado: json['mecanicoAsignado'] != null
            ? Usuario.fromJson(json['mecanicoAsignado'] as Map<String, dynamic>)
            : null,
      );

  /// Payload para creación: la app móvil solo captura el registro inicial
  /// de la orden (llegada del auto), así que no manda diagnóstico, fechas
  /// de salida ni mecánico asignado — eso se completa después desde el
  /// dashboard web.
  Map<String, dynamic> toCreateJson() => {
        'fechaEntrada': formatLocalDate(fechaEntrada),
        'kilometrajeIngreso': kilometrajeIngreso,
        'problemaReportado': problemaReportado,
        'vehiculo': vehiculo.toRef(),
      };
}
