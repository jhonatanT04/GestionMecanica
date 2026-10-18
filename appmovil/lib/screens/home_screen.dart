import 'package:flutter/material.dart';

import '../models/usuario.dart';
import '../services/api_client.dart';
import '../services/session_storage.dart';
import '../theme/app_theme.dart';
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
      body: GradientBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
            children: [
              const Text(
                'MecanicaSaas',
                style: TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 14,
                  letterSpacing: 0.3,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                usuario != null ? 'Hola, ${usuario!.nombre}' : 'Hola',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 40),
              const Text(
                'TALLER',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.6,
                ),
              ),
              const SizedBox(height: 16),
              _NuevaOrdenTile(
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => const ClienteSearchScreen(),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _ControlTile(
                      icon: Icons.dns_outlined,
                      titulo: 'Servidor',
                      detalle: 'URL del backend',
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const SettingsScreen(),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _ControlTile(
                      icon: Icons.logout,
                      titulo: 'Salir',
                      detalle: 'Cerrar sesión',
                      onTap: () => _cerrarSesion(context),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Tarjeta "encendida": la única acción primaria de la pantalla.
class _NuevaOrdenTile extends StatelessWidget {
  final VoidCallback onTap;

  const _NuevaOrdenTile({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return _Pressable(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppRadius.card),
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppColors.accentBright, AppColors.accent],
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.accent.withValues(alpha: 0.35),
              blurRadius: 24,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.18),
                borderRadius: BorderRadius.circular(AppRadius.control),
              ),
              child: const Icon(Icons.add_road, color: Colors.white, size: 28),
            ),
            const SizedBox(width: 16),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Nueva orden',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.3,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Registra la llegada de un vehículo',
                    style: TextStyle(color: Color(0xE6FFFFFF), fontSize: 13),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward, color: Colors.white),
          ],
        ),
      ),
    );
  }
}

class _ControlTile extends StatelessWidget {
  final IconData icon;
  final String titulo;
  final String detalle;
  final VoidCallback onTap;

  const _ControlTile({
    required this.icon,
    required this.titulo,
    required this.detalle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return _Pressable(
      onTap: onTap,
      child: Container(
        height: 112,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.card),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: AppColors.textMuted, size: 22),
            const Spacer(),
            Text(
              titulo,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.3,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              detalle,
              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}

/// Feedback táctil: la tarjeta se hunde un poco al presionarla.
class _Pressable extends StatefulWidget {
  final Widget child;
  final VoidCallback onTap;

  const _Pressable({required this.child, required this.onTap});

  @override
  State<_Pressable> createState() => _PressableState();
}

class _PressableState extends State<_Pressable> {
  bool _presionado = false;

  @override
  Widget build(BuildContext context) {
    final reducirMovimiento = MediaQuery.of(context).disableAnimations;
    return Semantics(
      button: true,
      child: GestureDetector(
        onTapDown: (_) => setState(() => _presionado = true),
        onTapCancel: () => setState(() => _presionado = false),
        onTapUp: (_) => setState(() => _presionado = false),
        onTap: widget.onTap,
        child: AnimatedScale(
          scale: _presionado && !reducirMovimiento ? 0.97 : 1,
          duration: const Duration(milliseconds: 120),
          child: widget.child,
        ),
      ),
    );
  }
}
