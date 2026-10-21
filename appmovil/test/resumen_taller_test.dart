import 'package:flutter_test/flutter_test.dart';

import 'package:appmovil/models/cliente.dart';
import 'package:appmovil/models/estado_orden.dart';
import 'package:appmovil/models/orden_de_trabajo.dart';
import 'package:appmovil/models/resumen_taller.dart';
import 'package:appmovil/models/vehiculo.dart';

const _cliente = Cliente(
  id: 1,
  nombres: 'Rosa',
  apellidos: 'Guamán',
  cedula: '',
  telefono: '',
  email: '',
  direccion: '',
);
const _vehiculo = Vehiculo(
  id: 1,
  placa: 'ABC-1234',
  modelo: 'Aveo',
  anio: 2015,
  kilometrajeActual: 1000,
  cliente: _cliente,
);

OrdenDeTrabajo _orden(
  int id,
  EstadoOrden estado,
  DateTime entrada, {
  DateTime? estimada,
}) => OrdenDeTrabajo(
  id: id,
  fechaEntrada: entrada,
  fechaEstimadaSalida: estimada,
  kilometrajeIngreso: 1000,
  problemaReportado: '',
  estado: estado,
  vehiculo: _vehiculo,
);

void main() {
  final ahora = DateTime(2026, 10, 20, 15, 30);
  final hoy = DateTime(2026, 10, 20);

  final ordenes = [
    _orden(1, EstadoOrden.recibido, hoy),
    _orden(
      2,
      EstadoOrden.enReparacion,
      DateTime(2026, 10, 10),
      estimada: DateTime(2026, 10, 15),
    ),
    _orden(
      3,
      EstadoOrden.listo,
      DateTime(2026, 10, 12),
      estimada: DateTime(2026, 10, 14),
    ),
    _orden(4, EstadoOrden.enDiagnostico, DateTime(2026, 10, 18)),
    _orden(5, EstadoOrden.entregado, hoy),
  ];

  test('deja fuera los entregados y cuenta por estado', () {
    final r = ResumenTaller.desde(ordenes, ahora);
    expect(r.enTaller.map((o) => o.id), isNot(contains(5)));
    expect(r.enTaller, hasLength(4));
    expect(r.porEstado[EstadoOrden.recibido], 1);
    expect(r.porEstado[EstadoOrden.enDiagnostico], 1);
    expect(r.porEstado[EstadoOrden.enReparacion], 1);
    expect(r.listas, 1);
  });

  test('un auto listo no cuenta como atrasado aunque pasó su fecha', () {
    final r = ResumenTaller.desde(ordenes, ahora);
    expect(r.atrasadas, 1);
    expect(ResumenTaller.estaAtrasada(ordenes[1], hoy), isTrue);
    expect(ResumenTaller.estaAtrasada(ordenes[2], hoy), isFalse);
  });

  test('ordena atrasados primero y luego por antigüedad', () {
    final r = ResumenTaller.desde(ordenes, ahora);
    expect(r.enTaller.map((o) => o.id), [2, 3, 4, 1]);
  });

  test('ingresos de hoy incluyen los ya entregados', () {
    expect(ResumenTaller.desde(ordenes, ahora).ingresosHoy, 2);
  });

  test('días en el taller', () {
    expect(ResumenTaller.diasEnTaller(ordenes[0], hoy), 0);
    expect(ResumenTaller.diasEnTaller(ordenes[1], hoy), 10);
  });
}
