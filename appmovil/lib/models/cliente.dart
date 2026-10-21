class Cliente {
  final int? id;
  final String nombres;
  final String apellidos;

  /// Vacía en clientes registrados antes de que se pidiera la cédula.
  final String cedula;
  final String telefono;
  final String email;
  final String direccion;

  const Cliente({
    this.id,
    required this.nombres,
    required this.apellidos,
    required this.cedula,
    required this.telefono,
    required this.email,
    required this.direccion,
  });

  String get nombreCompleto => '$nombres $apellidos'.trim();

  factory Cliente.fromJson(Map<String, dynamic> json) => Cliente(
    id: json['id'] as int?,
    nombres: json['nombres'] as String? ?? '',
    apellidos: json['apellidos'] as String? ?? '',
    cedula: json['cedula'] as String? ?? '',
    telefono: json['telefono'] as String? ?? '',
    email: json['email'] as String? ?? '',
    direccion: json['direccion'] as String? ?? '',
  );

  Map<String, dynamic> toJson() => {
    if (id != null) 'id': id,
    'nombres': nombres,
    'apellidos': apellidos,
    'cedula': cedula,
    'telefono': telefono,
    'email': email,
    'direccion': direccion,
  };

  /// Forma reducida para embeber como relación en otra entidad
  /// (el backend resuelve el resto a partir del id).
  Map<String, dynamic> toRef() => {'id': id};
}
