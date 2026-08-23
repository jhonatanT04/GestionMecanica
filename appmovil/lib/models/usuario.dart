/// Usuario mínimo (solo id + nombre por ahora). El backend todavía no
/// maneja roles ni autenticación para esta entidad.
class Usuario {
  final int id;
  final String nombre;

  const Usuario({required this.id, required this.nombre});

  factory Usuario.fromJson(Map<String, dynamic> json) => Usuario(
        id: json['id'] as int,
        nombre: json['nombre'] as String? ?? '',
      );

  Map<String, dynamic> toRef() => {'id': id};
}
