import 'api_client.dart';
import 'cliente_service.dart';
import 'orden_service.dart';
import 'vehiculo_service.dart';

// Instancias únicas y compartidas por toda la app. No hay convención previa
// de manejo de estado en el repo y el alcance actual (sin auth, sin datos
// que necesiten reactividad entre pantallas) no justifica sumar un paquete
// de DI/estado: basta con estos singletons simples.
final apiClient = ApiClient();
final clienteService = ClienteService(apiClient);
final vehiculoService = VehiculoService(apiClient);
final ordenService = OrdenService(apiClient);
