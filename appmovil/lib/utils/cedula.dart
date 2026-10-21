/// Misma validación que CedulaEcuador en el backend: 10 dígitos, provincia
/// 01-24 o 30, tercer dígito menor a 6 y dígito verificador módulo 10.
bool esCedulaValida(String cedula) {
  if (!RegExp(r'^\d{10}$').hasMatch(cedula)) return false;
  final digitos = cedula.split('').map(int.parse).toList();
  final provincia = digitos[0] * 10 + digitos[1];
  if (!((provincia >= 1 && provincia <= 24) || provincia == 30)) return false;
  if (digitos[2] >= 6) return false;
  var suma = 0;
  for (var i = 0; i < 9; i++) {
    final producto = digitos[i] * (i.isEven ? 2 : 1);
    suma += producto >= 10 ? producto - 9 : producto;
  }
  return (10 - suma % 10) % 10 == digitos[9];
}

/// Quita espacios y guiones que el usuario pueda escribir.
String limpiarCedula(String texto) => texto.replaceAll(RegExp(r'[\s-]'), '');
