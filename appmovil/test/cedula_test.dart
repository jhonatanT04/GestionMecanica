import 'package:flutter_test/flutter_test.dart';

import 'package:appmovil/utils/cedula.dart';

void main() {
  // Números sintéticos construidos con el algoritmo; no corresponden a personas.
  test('acepta cédulas con dígito verificador correcto', () {
    for (final c in ['0102030400', '1700000001', '0912345675', '3000000012']) {
      expect(esCedulaValida(c), isTrue, reason: c);
    }
  });

  test('rechaza cédulas inválidas', () {
    for (final c in [
      '',
      '0912345674',
      '2500000000',
      '0172345678',
      '091234567',
      '09123A5675',
    ]) {
      expect(esCedulaValida(c), isFalse, reason: c);
    }
  });

  test('limpia espacios y guiones', () {
    expect(limpiarCedula(' 091234567-5 '), '0912345675');
  });
}
