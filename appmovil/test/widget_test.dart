import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:appmovil/main.dart';

void main() {
  testWidgets('Muestra login cuando no hay sesión guardada', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const MecanicaSaasApp());
    await tester.pumpAndSettle();

    expect(find.text('Iniciar sesión'), findsOneWidget);
    expect(find.text('Ingresar'), findsOneWidget);
  });

  testWidgets('Va directo a Home si ya hay una sesión guardada', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({
      'auth_token': 'token-de-prueba',
      'auth_usuario': '{"id":1,"nombre":"Ana","email":"ana@taller.com","rol":"RECEPCIONISTA"}',
    });

    await tester.pumpWidget(const MecanicaSaasApp());
    await tester.pumpAndSettle();

    expect(find.text('MecanicaSaas'), findsOneWidget);
    expect(find.text('Hola, Ana'), findsOneWidget);
    expect(find.text('Nueva orden'), findsOneWidget);
  });
}
