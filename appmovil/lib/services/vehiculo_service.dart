import '../models/vehiculo.dart';
import 'api_client.dart';

class VehiculoService {
  final ApiClient _api;

  VehiculoService(this._api);

  /// La búsqueda en el backend es exacta y case-sensitive, por eso
  /// normalizamos la placa a mayúsculas antes de cada consulta o registro.
  Future<Vehiculo?> buscarPorPlaca(String placa) async {
    final data = await _api.getOrNull('/api/vehiculos/placa/${Uri.encodeComponent(placa.toUpperCase())}');
    if (data == null) return null;
    return Vehiculo.fromJson(data as Map<String, dynamic>);
  }

  Future<Vehiculo> crear(Vehiculo vehiculo) async {
    final data = await _api.post('/api/vehiculos', vehiculo.toJson());
    return Vehiculo.fromJson(data as Map<String, dynamic>);
  }
}
