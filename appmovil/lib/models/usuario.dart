/// Usuario autenticado. `email`/`rol` solo vienen en la respuesta de login;
/// como `mecanicoAsignado` dentro de una OrdenDeTrabajo el backend solo
/// manda id+nombre, así que ambos campos son opcionales.
class Usuario {
  final int id;
  final String nombre;
  final String? email;
  final String? rol;

  const Usuario({required this.id, required this.nombre, this.email, this.rol});

  factory Usuario.fromJson(Map<String, dynamic> json) => Usuario(
        id: json['id'] as int,
        nombre: json['nombre'] as String? ?? '',
        email: json['email'] as String?,
        rol: json['rol'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'nombre': nombre,
        if (email != null) 'email': email,
        if (rol != null) 'rol': rol,
      };

  Map<String, dynamic> toRef() => {'id': id};
}
