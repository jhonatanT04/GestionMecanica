import '../models/usuario.dart';
import 'api_client.dart';

class AuthResult {
  final String token;
  final Usuario usuario;

  const AuthResult({required this.token, required this.usuario});
}

class AuthService {
  final ApiClient _api;

  AuthService(this._api);

  Future<AuthResult> login(String email, String password) async {
    final data = await _api.post(
      '/api/auth/login',
      {'email': email, 'password': password},
      isAuthCall: true,
    );
    final json = data as Map<String, dynamic>;
    return AuthResult(
      token: json['token'] as String,
      usuario: Usuario.fromJson(json['usuario'] as Map<String, dynamic>),
    );
  }
}
