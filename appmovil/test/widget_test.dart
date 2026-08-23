import 'package:flutter_test/flutter_test.dart';

import 'package:appmovil/main.dart';

void main() {
  testWidgets('Home screen muestra el botón de nueva orden', (WidgetTester tester) async {
    await tester.pumpWidget(const MecanicaSaasApp());

    expect(find.text('MecanicaSaas'), findsOneWidget);
    expect(find.text('Nueva orden'), findsOneWidget);
  });
}
