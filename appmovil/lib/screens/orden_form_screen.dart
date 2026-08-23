import 'package:flutter/material.dart';

import '../models/orden_de_trabajo.dart';
import '../models/vehiculo.dart';
import '../services/api_client.dart';
import '../services/service_locator.dart';
import 'orden_creada_screen.dart';

class OrdenFormScreen extends StatefulWidget {
  final Vehiculo vehiculo;

  const OrdenFormScreen({super.key, required this.vehiculo});

  @override
  State<OrdenFormScreen> createState() => _OrdenFormScreenState();
}

class _OrdenFormScreenState extends State<OrdenFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late DateTime _fechaEntrada = DateTime.now();
  late final _kmController =
      TextEditingController(text: widget.vehiculo.kilometrajeActual.toString());
  final _problemaController = TextEditingController();
  bool _guardando = false;

  Future<void> _elegirFecha() async {
    final elegida = await showDatePicker(
      context: context,
      initialDate: _fechaEntrada,
      firstDate: DateTime.now().subtract(const Duration(days: 7)),
      lastDate: DateTime.now().add(const Duration(days: 1)),
    );
    if (elegida != null) setState(() => _fechaEntrada = elegida);
  }

  Future<void> _guardar() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _guardando = true);
    try {
      final orden = await ordenService.crear(OrdenDeTrabajo(
        fechaEntrada: _fechaEntrada,
        kilometrajeIngreso: int.parse(_kmController.text.trim()),
        problemaReportado: _problemaController.text.trim(),
        vehiculo: widget.vehiculo,
      ));
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => OrdenCreadaScreen(orden: orden)),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No se pudo crear la orden (${e.statusCode})')),
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
    final v = widget.vehiculo;
    return Scaffold(
      appBar: AppBar(title: const Text('Nueva orden de trabajo')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              Text('${v.marca} ${v.modelo} (${v.anio}) · ${v.placa}',
                  style: Theme.of(context).textTheme.titleMedium),
              Text('Propietario: ${v.cliente.nombre}'),
              const SizedBox(height: 16),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Fecha de entrada'),
                subtitle: Text(formatLocalDate(_fechaEntrada)),
                trailing: const Icon(Icons.calendar_today),
                onTap: _elegirFecha,
              ),
              TextFormField(
                controller: _kmController,
                decoration: const InputDecoration(labelText: 'Kilometraje de ingreso'),
                keyboardType: TextInputType.number,
                validator: (val) => int.tryParse(val?.trim() ?? '') == null ? 'Kilometraje inválido' : null,
              ),
              TextFormField(
                controller: _problemaController,
                decoration: const InputDecoration(labelText: 'Problema reportado'),
                maxLines: 4,
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _guardando ? null : _guardar,
                child: Text(_guardando ? 'Guardando...' : 'Crear orden'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
