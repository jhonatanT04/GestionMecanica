import '../models/marca.dart';
import 'api_client.dart';

class MarcaService {
  final ApiClient _api;

  MarcaService(this._api);

  /// Solo las activas: las desactivadas no se pueden asignar a vehículos nuevos.
  Future<List<Marca>> listarActivas() async {
    final data = await _api.get('/api/marcas?activas=true') as List<dynamic>;
    return data.map((e) => Marca.fromJson(e as Map<String, dynamic>)).toList();
  }
}
