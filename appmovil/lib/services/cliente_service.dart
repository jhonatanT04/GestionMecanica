import '../models/cliente.dart';
import 'api_client.dart';

class ClienteService {
  final ApiClient _api;

  ClienteService(this._api);

  Future<List<Cliente>> listar() async {
    final data = await _api.get('/api/clientes') as List<dynamic>;
    return data.map((e) => Cliente.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Cliente> crear(Cliente cliente) async {
    final data = await _api.post('/api/clientes', cliente.toJson());
    return Cliente.fromJson(data as Map<String, dynamic>);
  }
}
