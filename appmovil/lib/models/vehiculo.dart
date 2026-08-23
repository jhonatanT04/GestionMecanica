import 'cliente.dart';

class Vehiculo {
  final int? id;
  final String placa;
  final String marca;
  final String modelo;
  final int anio;
  final int kilometrajeActual;
  final Cliente cliente;

  const Vehiculo({
    this.id,
    required this.placa,
    required this.marca,
    required this.modelo,
    required this.anio,
    required this.kilometrajeActual,
    required this.cliente,
  });

  factory Vehiculo.fromJson(Map<String, dynamic> json) => Vehiculo(
        id: json['id'] as int?,
        placa: json['placa'] as String? ?? '',
        marca: json['marca'] as String? ?? '',
        modelo: json['modelo'] as String? ?? '',
        anio: json['anio'] as int? ?? 0,
        kilometrajeActual: json['kilometrajeActual'] as int? ?? 0,
        cliente: Cliente.fromJson(json['cliente'] as Map<String, dynamic>),
      );

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        'placa': placa,
        'marca': marca,
        'modelo': modelo,
        'anio': anio,
        'kilometrajeActual': kilometrajeActual,
        'cliente': cliente.toRef(),
      };

  Map<String, dynamic> toRef() => {'id': id};
}
