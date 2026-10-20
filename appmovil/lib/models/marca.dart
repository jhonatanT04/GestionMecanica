class Marca {
  final int id;
  final String nombre;
  final bool activa;

  const Marca({required this.id, required this.nombre, required this.activa});

  factory Marca.fromJson(Map<String, dynamic> json) => Marca(
        id: json['id'] as int,
        nombre: json['nombre'] as String? ?? '',
        activa: json['activa'] as bool? ?? true,
      );

  Map<String, dynamic> toRef() => {'id': id};
}
