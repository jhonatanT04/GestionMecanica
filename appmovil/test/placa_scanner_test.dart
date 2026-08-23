import 'package:flutter_test/flutter_test.dart';

import 'package:appmovil/screens/placa_scanner_screen.dart';

void main() {
  group('detectarPlaca', () {
    test('reconoce placa ya formateada con guion', () {
      expect(detectarPlaca('ABC-1234'), 'ABC-1234');
    });

    test('reconoce placa dentro de texto OCR con ruido', () {
      expect(detectarPlaca('ECUADOR\nPBX1234\nCOTOPAXI'), 'PBX-1234');
    });

    test('normaliza minúsculas y espacios', () {
      expect(detectarPlaca('abc 1234'), 'ABC-1234');
    });

    test('soporta placas de 3 dígitos', () {
      expect(detectarPlaca('XYZ123'), 'XYZ-123');
    });

    test('devuelve null si no hay coincidencia', () {
      expect(detectarPlaca('TEXTO SIN PLACA'), isNull);
    });
  });
}
