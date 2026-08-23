class Cliente {
  final int? id;
  final String nombre;
  final String telefono;
  final String email;
  final String direccion;

  const Cliente({
    this.id,
    required this.nombre,
    required this.telefono,
    required this.email,
    required this.direccion,
  });

  factory Cliente.fromJson(Map<String, dynamic> json) => Cliente(
        id: json['id'] as int?,
        nombre: json['nombre'] as String? ?? '',
        telefono: json['telefono'] as String? ?? '',
        email: json['email'] as String? ?? '',
        direccion: json['direccion'] as String? ?? '',
      );

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        'nombre': nombre,
        'telefono': telefono,
        'email': email,
        'direccion': direccion,
      };

  /// Forma reducida para embeber como relación en otra entidad
  /// (el backend resuelve el resto a partir del id).
  Map<String, dynamic> toRef() => {'id': id};
}
