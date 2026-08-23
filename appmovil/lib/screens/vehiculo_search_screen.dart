import 'package:flutter/material.dart';

import '../models/cliente.dart';
import '../models/vehiculo.dart';
import '../services/api_client.dart';
import '../services/service_locator.dart';
import 'orden_form_screen.dart';
import 'placa_scanner_screen.dart';
import 'vehiculo_form_screen.dart';

class VehiculoSearchScreen extends StatefulWidget {
  final Cliente cliente;

  const VehiculoSearchScreen({super.key, required this.cliente});

  @override
  State<VehiculoSearchScreen> createState() => _VehiculoSearchScreenState();
}

class _VehiculoSearchScreenState extends State<VehiculoSearchScreen> {
  final _placaController = TextEditingController();
  bool _buscando = false;
  String? _mensaje;

  Future<void> _escanear() async {
    final placa = await Navigator.of(context).push<String>(
      MaterialPageRoute(builder: (_) => const PlacaScannerScreen()),
    );
    if (placa != null) {
      _placaController.text = placa;
      await _buscar();
    }
  }

  Future<void> _buscar() async {
    final placa = _placaController.text.trim().toUpperCase();
    if (placa.isEmpty) {
      setState(() => _mensaje = 'Ingresa o escanea una placa');
      return;
    }
    setState(() {
      _buscando = true;
      _mensaje = null;
    });
    try {
      final vehiculo = await vehiculoService.buscarPorPlaca(placa);
      if (!mounted) return;
      setState(() => _buscando = false);
      if (vehiculo != null) {
        await _continuarConVehiculo(vehiculo);
      } else {
        final creado = await Navigator.of(context).push<Vehiculo>(
          MaterialPageRoute(
            builder: (_) => VehiculoFormScreen(cliente: widget.cliente, placaInicial: placa),
          ),
        );
        if (creado != null) await _continuarConVehiculo(creado);
      }
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _buscando = false;
        _mensaje = 'Error buscando el vehículo (${e.statusCode})';
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _buscando = false;
        _mensaje = 'No se pudo conectar con el servidor';
      });
    }
  }

  Future<void> _continuarConVehiculo(Vehiculo vehiculo) async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => OrdenFormScreen(vehiculo: vehiculo)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Vehículo de ${widget.cliente.nombre}')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ElevatedButton.icon(
              onPressed: _escanear,
              icon: const Icon(Icons.camera_alt),
              label: const Text('Escanear placa con la cámara'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _placaController,
              textCapitalization: TextCapitalization.characters,
              decoration: const InputDecoration(
                labelText: 'Placa',
                hintText: 'AAA-1234',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _buscando ? null : _buscar,
              child: Text(_buscando ? 'Buscando...' : 'Buscar vehículo'),
            ),
            if (_mensaje != null) ...[
              const SizedBox(height: 16),
              Text(_mensaje!, style: const TextStyle(color: Colors.red)),
            ],
          ],
        ),
      ),
    );
  }
}
