import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/usuario.dart';

typedef Sesion = ({String token, Usuario usuario});

/// Persistencia local de la sesión (token + usuario), mismo patrón que
/// [ApiConfig] para la URL base. Permite que el usuario no tenga que
/// loguearse cada vez que abre la app.
class SessionStorage {
  SessionStorage._();

  static const _tokenKey = 'auth_token';
  static const _usuarioKey = 'auth_usuario';

  static Future<void> guardar(String token, Usuario usuario) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_usuarioKey, jsonEncode(usuario.toJson()));
  }

  static Future<Sesion?> cargar() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    final usuarioJson = prefs.getString(_usuarioKey);
    if (token == null || usuarioJson == null) return null;
    return (
      token: token,
      usuario: Usuario.fromJson(jsonDecode(usuarioJson) as Map<String, dynamic>),
    );
  }

  static Future<void> limpiar() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_usuarioKey);
  }
}
