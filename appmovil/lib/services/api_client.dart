import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';

class ApiException implements Exception {
  final int statusCode;
  final String body;

  ApiException(this.statusCode, this.body);

  /// Extrae `message` del shape de error del backend
  /// (`{timestamp,status,error,message}`); si el cuerpo no es JSON o no
  /// trae `message`, cae al cuerpo crudo.
  String get message {
    try {
      final decoded = jsonDecode(body);
      if (decoded is Map && decoded['message'] is String) {
        return decoded['message'] as String;
      }
    } catch (_) {
      // El cuerpo no era JSON.
    }
    return body.isNotEmpty ? body : 'Error $statusCode';
  }

  @override
  String toString() => 'ApiException($statusCode): $body';
}

/// Cliente HTTP delgado sobre la API REST del backend.
///
/// [authToken] se setea tras un login exitoso y se manda en
/// `Authorization: Bearer` en todas las llamadas salientes. Si el backend
/// responde 401 en una llamada que no es de login (`isAuthCall: false`),
/// se dispara [onUnauthorized] para que la capa de UI limpie la sesión y
/// regrese a la pantalla de login.
class ApiClient {
  static String? authToken;
  static void Function()? onUnauthorized;

  final http.Client _http = http.Client();

  Future<Uri> _uri(String path) async {
    final base = await ApiConfig.getBaseUrl();
    return Uri.parse('$base$path');
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (authToken != null) 'Authorization': 'Bearer $authToken',
      };

  /// GET que devuelve `null` en 404 (útil para búsquedas tipo "por placa").
  Future<dynamic> getOrNull(String path) async {
    final res = await _http.get(await _uri(path), headers: _headers);
    if (res.statusCode == 404) return null;
    return _decode(res);
  }

  Future<dynamic> get(String path) async {
    final res = await _http.get(await _uri(path), headers: _headers);
    return _decode(res);
  }

  Future<dynamic> post(String path, Map<String, dynamic> body, {bool isAuthCall = false}) async {
    final res = await _http.post(
      await _uri(path),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _decode(res, isAuthCall: isAuthCall);
  }

  dynamic _decode(http.Response res, {bool isAuthCall = false}) {
    if (res.statusCode == 401 && !isAuthCall) {
      onUnauthorized?.call();
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException(res.statusCode, res.body);
    }
    if (res.body.isEmpty) return null;
    return jsonDecode(utf8.decode(res.bodyBytes));
  }
}
