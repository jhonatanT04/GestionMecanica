import 'package:flutter/material.dart';

import 'screens/home_screen.dart';

void main() {
  runApp(const MecanicaSaasApp());
}

class MecanicaSaasApp extends StatelessWidget {
  const MecanicaSaasApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MecanicaSaas',
      theme: ThemeData(colorSchemeSeed: Colors.indigo, useMaterial3: true),
      home: const HomeScreen(),
    );
  }
}
