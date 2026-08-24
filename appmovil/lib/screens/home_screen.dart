import 'package:flutter/material.dart';

import '../models/usuario.dart';
import '../services/api_client.dart';
import '../services/session_storage.dart';
import 'cliente_search_screen.dart';
import 'login_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatelessWidget {
  final Usuario? usuario;

  const HomeScreen({super.key, this.usuario});

  Future<void> _cerrarSesion(BuildContext context) async {
    await SessionStorage.limpiar();
    ApiClient.authToken = null;
    if (!context.mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MecanicaSaas'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            tooltip: 'Configuración',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const SettingsScreen()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Cerrar sesión',
            onPressed: () => _cerrarSesion(context),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (usuario != null) ...[
              Text('Hola, ${usuario!.nombre}', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 24),
            ],
            ElevatedButton.icon(
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ClienteSearchScreen()),
              ),
              icon: const Icon(Icons.add_box),
              label: const Text('Nueva orden'),
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16)),
            ),
          ],
        ),
      ),
    );
  }
}
