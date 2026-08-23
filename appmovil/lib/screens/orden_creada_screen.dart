import 'package:flutter/material.dart';

import '../models/estado_orden.dart';
import '../models/orden_de_trabajo.dart';

class OrdenCreadaScreen extends StatelessWidget {
  final OrdenDeTrabajo orden;

  const OrdenCreadaScreen({super.key, required this.orden});

  @override
  Widget build(BuildContext context) {
    final v = orden.vehiculo;
    return Scaffold(
      appBar: AppBar(title: const Text('Orden creada')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 72),
            const SizedBox(height: 16),
            Text('Orden #${orden.id} registrada',
                style: Theme.of(context).textTheme.headlineSmall,
                textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text('${v.marca} ${v.modelo} · ${v.placa}', textAlign: TextAlign.center),
            Text('Propietario: ${v.cliente.nombre}', textAlign: TextAlign.center),
            Text('Estado: ${orden.estado.etiqueta}', textAlign: TextAlign.center),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
              child: const Text('Volver al inicio'),
            ),
          ],
        ),
      ),
    );
  }
}
