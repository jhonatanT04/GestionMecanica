import 'package:flutter/material.dart';

import '../models/cliente.dart';
import '../services/api_client.dart';
import '../services/service_locator.dart';
import '../theme/app_theme.dart';
import '../widgets/flow_steps.dart';
import 'cliente_form_screen.dart';
import 'vehiculo_search_screen.dart';

class ClienteSearchScreen extends StatefulWidget {
  const ClienteSearchScreen({super.key});

  @override
  State<ClienteSearchScreen> createState() => _ClienteSearchScreenState();
}

class _ClienteSearchScreenState extends State<ClienteSearchScreen> {
  List<Cliente> _clientes = [];
  bool _cargando = true;
  String? _error;
  String _filtro = '';

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() {
      _cargando = true;
      _error = null;
    });
    try {
      final clientes = await clienteService.listar();
      if (!mounted) return;
      setState(() {
        _clientes = clientes;
        _cargando = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _cargando = false;
        _error = 'Error cargando clientes (${e.statusCode})';
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _cargando = false;
        _error = 'No se pudo conectar con el servidor. Revisa la URL en Configuración.';
      });
    }
  }

  Future<void> _crearCliente() async {
    final creado = await Navigator.of(context).push<Cliente>(
      MaterialPageRoute(builder: (_) => const ClienteFormScreen()),
    );
    if (creado != null) _continuarConCliente(creado);
  }

  void _continuarConCliente(Cliente cliente) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => VehiculoSearchScreen(cliente: cliente)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtroLower = _filtro.trim().toLowerCase();
    final visibles = filtroLower.isEmpty
        ? _clientes
        : _clientes
              .where(
                (c) =>
                    c.nombre.toLowerCase().contains(filtroLower) ||
                    c.telefono.toLowerCase().contains(filtroLower),
              )
              .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nueva orden'),
        bottom: const FlowSteps(actual: PasoRegistro.cliente),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: const InputDecoration(
                labelText: 'Buscar cliente por nombre o teléfono',
                prefixIcon: Icon(Icons.search),
              ),
              onChanged: (v) => setState(() => _filtro = v),
            ),
          ),
          Expanded(
            child: _cargando
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(_error!, textAlign: TextAlign.center),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          onPressed: _cargar,
                          child: const Text('Reintentar'),
                        ),
                      ],
                    ),
                  )
                : visibles.isEmpty
                ? const Center(child: Text('Sin resultados'))
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 96),
                    itemCount: visibles.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 8),
                    itemBuilder: (context, i) {
                      final c = visibles[i];
                      return ListTile(
                        tileColor: AppColors.surface,
                        leading: CircleAvatar(
                          backgroundColor: AppColors.surfaceHigh,
                          foregroundColor: AppColors.text,
                          child: Text(
                            c.nombre.isNotEmpty
                                ? c.nombre[0].toUpperCase()
                                : '?',
                          ),
                        ),
                        title: Text(
                          c.nombre,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        subtitle: Text(c.telefono),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => _continuarConCliente(c),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _crearCliente,
        icon: const Icon(Icons.person_add),
        label: const Text('Nuevo cliente'),
      ),
    );
  }
}
