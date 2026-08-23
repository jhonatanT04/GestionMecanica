import 'package:shared_preferences/shared_preferences.dart';

/// Configuración de la URL base del backend. Persistida localmente para
/// poder apuntar a distintas IPs (emulador vs celular físico en la misma
/// red del taller) sin recompilar la app.
class ApiConfig {
  ApiConfig._();

  // 10.0.2.2 es el alias que usa el emulador de Android para llegar al
  // localhost de la máquina host. En iOS simulator "localhost" funciona
  // directo; en un celular físico hay que apuntar a la IP LAN del backend.
  static const defaultBaseUrl = 'http://10.0.2.2:8080';

  static const _prefsKey = 'api_base_url';

  static Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_prefsKey) ?? defaultBaseUrl;
  }

  static Future<void> setBaseUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    var normalized = url.trim();
    if (normalized.endsWith('/')) {
      normalized = normalized.substring(0, normalized.length - 1);
    }
    await prefs.setString(_prefsKey, normalized);
  }
}
