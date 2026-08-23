import '../models/orden_de_trabajo.dart';
import 'api_client.dart';

class OrdenService {
  final ApiClient _api;

  OrdenService(this._api);

  Future<OrdenDeTrabajo> crear(OrdenDeTrabajo orden) async {
    final data = await _api.post('/api/ordenes', orden.toCreateJson());
    return OrdenDeTrabajo.fromJson(data as Map<String, dynamic>);
  }
}
