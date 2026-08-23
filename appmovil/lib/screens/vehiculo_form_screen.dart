import 'package:flutter/material.dart';

import '../models/cliente.dart';
import '../models/vehiculo.dart';
import '../services/api_client.dart';
import '../services/service_locator.dart';

class VehiculoFormScreen extends StatefulWidget {
  final Cliente cliente;
  final String placaInicial;

  const VehiculoFormScreen({super.key, required this.cliente, required this.placaInicial});

  @override
  State<VehiculoFormScreen> createState() => _VehiculoFormScreenState();
}

class _VehiculoFormScreenState extends State<VehiculoFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final _placaController = TextEditingController(text: widget.placaInicial);
  final _marcaController = TextEditingController();
  final _modeloController = TextEditingController();
  final _anioController = TextEditingController();
  final _kmController = TextEditingController(text: '0');
  bool _guardando = false;

  Future<void> _guardar() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _guardando = true);
    try {
      final vehiculo = await vehiculoService.crear(Vehiculo(
        placa: _placaController.text.trim().toUpperCase(),
        marca: _marcaController.text.trim(),
        modelo: _modeloController.text.trim(),
        anio: int.parse(_anioController.text.trim()),
        kilometrajeActual: int.parse(_kmController.text.trim()),
        cliente: widget.cliente,
      ));
      if (!mounted) return;
      Navigator.of(context).pop(vehiculo);
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No se pudo registrar el vehículo (${e.statusCode})')),
      );
      setState(() => _guardando = false);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No se pudo conectar con el servidor')),
      );
      setState(() => _guardando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nuevo vehículo')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              Text('Propietario: ${widget.cliente.nombre}'),
              const SizedBox(height: 16),
              TextFormField(
                controller: _placaController,
                textCapitalization: TextCapitalization.characters,
                decoration: const InputDecoration(labelText: 'Placa'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
              ),
              TextFormField(
                controller: _marcaController,
                decoration: const InputDecoration(labelText: 'Marca'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
              ),
              TextFormField(
                controller: _modeloController,
                decoration: const InputDecoration(labelText: 'Modelo'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
              ),
              TextFormField(
                controller: _anioController,
                decoration: const InputDecoration(labelText: 'Año'),
                keyboardType: TextInputType.number,
                validator: (v) => int.tryParse(v?.trim() ?? '') == null ? 'Año inválido' : null,
              ),
              TextFormField(
                controller: _kmController,
                decoration: const InputDecoration(labelText: 'Kilometraje actual'),
                keyboardType: TextInputType.number,
                validator: (v) => int.tryParse(v?.trim() ?? '') == null ? 'Kilometraje inválido' : null,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _guardando ? null : _guardar,
                child: Text(_guardando ? 'Guardando...' : 'Guardar vehículo'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
