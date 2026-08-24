import 'package:flutter/material.dart';

import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'services/api_client.dart';
import 'services/session_storage.dart';

/// Navigator global: permite que [ApiClient.onUnauthorized] regrese a
/// login desde fuera del árbol de widgets cuando cualquier llamada
/// devuelve 401 (sesión vencida/token inválido).
final navigatorKey = GlobalKey<NavigatorState>();

void main() {
  ApiClient.onUnauthorized = () {
    SessionStorage.limpiar();
    ApiClient.authToken = null;
    navigatorKey.currentState?.pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  };
  runApp(const MecanicaSaasApp());
}

class MecanicaSaasApp extends StatelessWidget {
  const MecanicaSaasApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: navigatorKey,
      title: 'MecanicaSaas',
      theme: ThemeData(colorSchemeSeed: Colors.indigo, useMaterial3: true),
      home: const AuthGate(),
    );
  }
}

/// Decide la pantalla inicial: si hay una sesión guardada va directo a
/// [HomeScreen] (no se valida vencimiento del token localmente — el
/// primer 401 real dispara el logout vía [ApiClient.onUnauthorized]);
/// si no, muestra [LoginScreen].
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Sesion?>(
      future: SessionStorage.cargar(),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }
        final sesion = snapshot.data;
        if (sesion == null) {
          return const LoginScreen();
        }
        ApiClient.authToken = sesion.token;
        return HomeScreen(usuario: sesion.usuario);
      },
    );
  }
}
