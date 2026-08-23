import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';

class ApiException implements Exception {
  final int statusCode;
  final String body;

  ApiException(this.statusCode, this.body);

  @override
  String toString() => 'ApiException($statusCode): $body';
}

/// Cliente HTTP delgado sobre la API REST del backend.
///
/// Punto de extensión para auth: hoy el backend no tiene JWT, así que
/// [authToken] queda en null y no se manda Authorization. Cuando se
/// implemente login, basta con setear `ApiClient.authToken` tras
/// autenticar y todas las llamadas empiezan a mandar el header.
class ApiClient {
  static String? authToken;

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

  Future<dynamic> post(String path, Map<String, dynamic> body) async {
    final res = await _http.post(
      await _uri(path),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _decode(res);
  }

  dynamic _decode(http.Response res) {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException(res.statusCode, res.body);
    }
    if (res.body.isEmpty) return null;
    return jsonDecode(utf8.decode(res.bodyBytes));
  }
}
