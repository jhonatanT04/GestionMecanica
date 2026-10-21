import 'package:flutter/material.dart';

import '../models/estado_orden.dart';
import '../models/orden_de_trabajo.dart';
import '../models/resumen_taller.dart';
import '../models/usuario.dart';
import '../services/api_client.dart';
import '../services/service_locator.dart';
import '../services/session_storage.dart';
import '../theme/app_theme.dart';
import 'cliente_search_screen.dart';
import 'login_screen.dart';
import 'settings_screen.dart';

const _rolLabels = {
  'DUENO': 'Dueño',
  'MECANICO': 'Mecánico',
  'RECEPCIONISTA': 'Recepción',
};

class HomeScreen extends StatefulWidget {
  final Usuario? usuario;

  /// Fuente de las órdenes; por defecto la API. Se puede reemplazar en tests.
  final Future<List<OrdenDeTrabajo>> Function()? cargarOrdenes;

  const HomeScreen({super.key, this.usuario, this.cargarOrdenes});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  ResumenTaller? _resumen;
  bool _cargando = true;
  String? _error;

  /// Estado por el que se filtra la lista; null = todos los del taller.
  EstadoOrden? _filtro;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() {
      _cargando = _resumen == null;
      _error = null;
    });
    try {
      final ordenes = await (widget.cargarOrdenes ?? ordenService.listar)();
      if (!mounted) return;
      setState(() {
        _resumen = ResumenTaller.desde(ordenes, DateTime.now());
        _cargando = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _cargando = false;
        _error = 'No se pudieron cargar las órdenes (${e.statusCode})';
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _cargando = false;
        _error = 'No se pudo conectar con el servidor.';
      });
    }
  }

  Future<void> _nuevaOrden() async {
    await Navigator.of(context)
        .push(MaterialPageRoute(builder: (_) => const ClienteSearchScreen()));
    // Al volver (con o sin orden nueva) el resumen puede haber cambiado.
    if (mounted) _cargar();
  }

  Future<void> _abrirServidor() async {
    await Navigator.of(context)
        .push(MaterialPageRoute(builder: (_) => const SettingsScreen()));
    if (mounted) _cargar();
  }

  Future<void> _cerrarSesion() async {
    await SessionStorage.limpiar();
    ApiClient.authToken = null;
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final usuario = widget.usuario;

    return Scaffold(
      body: GradientBackground(
        child: SafeArea(
          child: RefreshIndicator(
            onRefresh: _cargar,
            color: AppColors.accentBright,
            backgroundColor: AppColors.surface,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'MecanicaSaas',
                            style: TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            usuario != null
                                ? 'Hola, ${usuario.nombre}'
                                : 'Hola',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    _MenuUsuario(
                      usuario: usuario,
                      onServidor: _abrirServidor,
                      onCerrarSesion: _cerrarSesion,
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                _NuevaOrdenTile(onTap: _nuevaOrden),
                const SizedBox(height: 28),
                ..._contenidoTaller(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _contenidoTaller() {
    final resumen = _resumen;

    if (_cargando) return const [_ResumenSkeleton()];

    if (resumen == null) {
      return [
        _AvisoError(mensaje: _error ?? 'Sin datos', onReintentar: _cargar),
      ];
    }

    final lista = _filtro == null
        ? resumen.enTaller
        : resumen.enTaller.where((o) => o.estado == _filtro).toList();

    return [
      if (_error != null) ...[
        _AvisoError(mensaje: _error!, onReintentar: _cargar),
        const SizedBox(height: 16),
      ],
      _ResumenCard(
        resumen: resumen,
        filtro: _filtro,
        onFiltro: (e) => setState(() => _filtro = _filtro == e ? null : e),
      ),
      const SizedBox(height: 12),
      IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: _Indicador(
                valor: resumen.listas,
                etiqueta: 'Listos para entregar',
                icono: Icons.task_alt,
                color: AppColors.success,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _Indicador(
                valor: resumen.atrasadas,
                etiqueta: 'Atrasados',
                icono: Icons.schedule,
                color: AppColors.error,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _Indicador(
                valor: resumen.ingresosHoy,
                etiqueta: 'Ingresaron hoy',
                icono: Icons.login,
                color: AppColors.accentBright,
              ),
            ),
          ],
        ),
      ),
      const SizedBox(height: 28),
      Row(
        crossAxisAlignment: CrossAxisAlignment.baseline,
        textBaseline: TextBaseline.alphabetic,
        children: [
          Expanded(
            child: Text(
              _filtro == null ? 'Vehículos en el taller' : _filtro!.etiqueta,
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
            ),
          ),
          if (_filtro != null)
            TextButton(
              onPressed: () => setState(() => _filtro = null),
              child: const Text('Ver todos'),
            ),
        ],
      ),
      const SizedBox(height: 10),
      if (lista.isEmpty)
        _ListaVacia(hayFiltro: _filtro != null)
      else
        for (final orden in lista) ...[
          _VehiculoCard(orden: orden, onTap: () => _mostrarDetalle(orden)),
          const SizedBox(height: 10),
        ],
    ];
  }

  void _mostrarDetalle(OrdenDeTrabajo orden) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.surface,
      showDragHandle: true,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppRadius.card + 8),
        ),
      ),
      builder: (_) => _DetalleOrden(orden: orden),
    );
  }
}

// ---------------------------------------------------------------------------
// Menú de usuario (avatar arriba a la derecha)
// ---------------------------------------------------------------------------

enum _AccionUsuario { servidor, cerrarSesion }

class _MenuUsuario extends StatelessWidget {
  final Usuario? usuario;
  final VoidCallback onServidor;
  final VoidCallback onCerrarSesion;

  const _MenuUsuario({
    required this.usuario,
    required this.onServidor,
    required this.onCerrarSesion,
  });

  String get _iniciales {
    final partes = (usuario?.nombre ?? '')
        .trim()
        .split(RegExp(r'\s+'))
        .where((p) => p.isNotEmpty)
        .take(2);
    final iniciales = partes.map((p) => p[0].toUpperCase()).join();
    return iniciales.isEmpty ? '?' : iniciales;
  }

  @override
  Widget build(BuildContext context) {
    final rol = _rolLabels[usuario?.rol];

    return PopupMenuButton<_AccionUsuario>(
      tooltip: 'Cuenta',
      offset: const Offset(0, 56),
      color: AppColors.surfaceHigh,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.control),
      ),
      onSelected: (accion) => switch (accion) {
        _AccionUsuario.servidor => onServidor(),
        _AccionUsuario.cerrarSesion => onCerrarSesion(),
      },
      itemBuilder: (_) => [
        PopupMenuItem<_AccionUsuario>(
          enabled: false,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                usuario?.nombre ?? 'Usuario',
                style: const TextStyle(
                  color: AppColors.text,
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (rol != null || usuario?.email != null)
                Text(
                  [rol, usuario?.email].whereType<String>().join(' · '),
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 12,
                  ),
                ),
            ],
          ),
        ),
        const PopupMenuDivider(),
        const PopupMenuItem(
          value: _AccionUsuario.servidor,
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(Icons.dns_outlined),
            title: Text('Servidor'),
          ),
        ),
        const PopupMenuItem(
          value: _AccionUsuario.cerrarSesion,
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(Icons.logout, color: AppColors.error),
            title: Text(
              'Cerrar sesión',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ),
      ],
      child: Container(
        padding: const EdgeInsets.all(2),
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          color: AppColors.accentBright,
        ),
        child: CircleAvatar(
          radius: 22,
          backgroundColor: AppColors.surfaceHigh,
          foregroundColor: AppColors.text,
          child: Text(
            _iniciales,
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Acción principal
// ---------------------------------------------------------------------------

class _NuevaOrdenTile extends StatelessWidget {
  final VoidCallback onTap;

  const _NuevaOrdenTile({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return _Pressable(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppColors.accent,
          borderRadius: BorderRadius.circular(AppRadius.card),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.18),
                borderRadius: BorderRadius.circular(AppRadius.control),
              ),
              child: const Icon(Icons.add_road, color: Colors.white, size: 26),
            ),
            const SizedBox(width: 16),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Nueva orden',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Registra la llegada de un vehículo',
                    style: TextStyle(color: Color(0xE6FFFFFF), fontSize: 13),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward, color: Colors.white),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Resumen del taller
// ---------------------------------------------------------------------------

class _ResumenCard extends StatelessWidget {
  final ResumenTaller resumen;
  final EstadoOrden? filtro;
  final ValueChanged<EstadoOrden> onFiltro;

  const _ResumenCard({
    required this.resumen,
    required this.filtro,
    required this.onFiltro,
  });

  static const _cortas = {
    EstadoOrden.recibido: 'Recibidos',
    EstadoOrden.enDiagnostico: 'Diagnóstico',
    EstadoOrden.enReparacion: 'Reparación',
    EstadoOrden.listo: 'Listos',
  };

  @override
  Widget build(BuildContext context) {
    final total = resumen.enTaller.length;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.card),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'En el taller',
            style: TextStyle(color: AppColors.textMuted, fontSize: 14),
          ),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '$total',
                style: const TextStyle(
                  fontSize: 44,
                  height: 1.1,
                  fontWeight: FontWeight.w700,
                  color: AppColors.text,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                total == 1 ? 'vehículo' : 'vehículos',
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ),
          if (total > 0) ...[
            const SizedBox(height: 14),
            _BarraEstados(resumen: resumen),
          ],
          const SizedBox(height: 14),
          Row(
            children: [
              for (final (i, estado)
                  in ResumenTaller.estadosAbiertos.indexed) ...[
                if (i > 0) const SizedBox(width: 8),
                Expanded(
                  child: _ChipEstado(
                    etiqueta: _cortas[estado]!,
                    valor: resumen.porEstado[estado] ?? 0,
                    color: _colorEstado(estado),
                    seleccionado: filtro == estado,
                    onTap: () => onFiltro(estado),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

/// Color por estado, de "recién llegado" (apagado) a "listo" (verde).
Color _colorEstado(EstadoOrden e) => switch (e) {
  EstadoOrden.recibido => AppColors.textMuted,
  EstadoOrden.enDiagnostico => const Color(0xFFF2C14E),
  EstadoOrden.enReparacion => AppColors.accentBright,
  EstadoOrden.listo => AppColors.success,
  EstadoOrden.entregado => AppColors.border,
};

/// Barra apilada con la proporción de vehículos en cada estado.
class _BarraEstados extends StatelessWidget {
  final ResumenTaller resumen;

  const _BarraEstados({required this.resumen});

  @override
  Widget build(BuildContext context) {
    final tramos = ResumenTaller.estadosAbiertos
        .where((e) => (resumen.porEstado[e] ?? 0) > 0)
        .toList();
    return ClipRRect(
      borderRadius: BorderRadius.circular(4),
      child: SizedBox(
        height: 8,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            for (final (i, e) in tramos.indexed) ...[
              if (i > 0) const SizedBox(width: 2),
              Expanded(
                flex: resumen.porEstado[e]!,
                child: ColoredBox(color: _colorEstado(e)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ChipEstado extends StatelessWidget {
  final String etiqueta;
  final int valor;
  final Color color;
  final bool seleccionado;
  final VoidCallback onTap;

  const _ChipEstado({
    required this.etiqueta,
    required this.valor,
    required this.color,
    required this.seleccionado,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: seleccionado,
      label: '$etiqueta: $valor',
      child: Material(
        color: seleccionado ? AppColors.surfaceHigh : AppColors.background,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: seleccionado ? color : Colors.transparent,
            width: 1.5,
          ),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
            child: ExcludeSemantics(
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: color,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '$valor',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      etiqueta,
                      maxLines: 1,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Indicador extends StatelessWidget {
  final int valor;
  final String etiqueta;
  final IconData icono;
  final Color color;

  const _Indicador({
    required this.valor,
    required this.etiqueta,
    required this.icono,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final activo = valor > 0;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.card),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icono, size: 20, color: activo ? color : AppColors.textMuted),
          const SizedBox(height: 10),
          Text(
            '$valor',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: activo ? AppColors.text : AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            etiqueta,
            maxLines: 2,
            style: const TextStyle(
              fontSize: 12,
              height: 1.25,
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Lista de vehículos
// ---------------------------------------------------------------------------

String _dias(int n) => switch (n) {
  <= 0 => 'Hoy',
  1 => '1 día',
  _ => '$n días',
};

String _nombreVehiculo(OrdenDeTrabajo o) {
  final v = o.vehiculo;
  return [
    v.marca?.nombre,
    v.modelo,
  ].whereType<String>().where((s) => s.isNotEmpty).join(' ');
}

class _VehiculoCard extends StatelessWidget {
  final OrdenDeTrabajo orden;
  final VoidCallback onTap;

  const _VehiculoCard({required this.orden, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final hoy = DateUtils.dateOnly(DateTime.now());
    final atrasada = ResumenTaller.estaAtrasada(orden, hoy);
    final dias = ResumenTaller.diasEnTaller(orden, hoy);
    final color = _colorEstado(orden.estado);

    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(AppRadius.card),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.card),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.directions_car, color: color),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            _nombreVehiculo(orden).isEmpty
                                ? orden.vehiculo.placa
                                : _nombreVehiculo(orden),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        _EtiquetaEstado(estado: orden.estado),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${orden.vehiculo.placa} · ${orden.vehiculo.cliente.nombreCompleto}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(
                          atrasada ? Icons.schedule : Icons.timelapse,
                          size: 14,
                          color: atrasada
                              ? AppColors.error
                              : AppColors.textMuted,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          atrasada ? 'Atrasado · ${_dias(dias)}' : _dias(dias),
                          style: TextStyle(
                            fontSize: 12,
                            color: atrasada
                                ? AppColors.error
                                : AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(width: 10),
                        const Icon(
                          Icons.engineering,
                          size: 14,
                          color: AppColors.textMuted,
                        ),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            orden.mecanicoAsignado?.nombre ?? 'Sin asignar',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EtiquetaEstado extends StatelessWidget {
  final EstadoOrden estado;

  const _EtiquetaEstado({required this.estado});

  @override
  Widget build(BuildContext context) {
    final color = _colorEstado(estado);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        estado.etiqueta,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

class _DetalleOrden extends StatelessWidget {
  final OrdenDeTrabajo orden;

  const _DetalleOrden({required this.orden});

  String _fecha(DateTime? d) => d == null
      ? 'Sin definir'
      : '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';

  @override
  Widget build(BuildContext context) {
    final v = orden.vehiculo;
    final diagnostico = orden.diagnostico?.trim() ?? '';

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    _nombreVehiculo(orden).isEmpty
                        ? v.placa
                        : _nombreVehiculo(orden),
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
                _EtiquetaEstado(estado: orden.estado),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              'Orden #${orden.id ?? '-'} · ${v.placa} · ${v.anio}',
              style: const TextStyle(color: AppColors.textMuted),
            ),
            const SizedBox(height: 20),
            _Dato(
              icono: Icons.person_outline,
              titulo: 'Cliente',
              valor: v.cliente.nombreCompleto,
            ),
            if (v.cliente.telefono.isNotEmpty)
              _Dato(
                icono: Icons.phone_outlined,
                titulo: 'Teléfono',
                valor: v.cliente.telefono,
              ),
            _Dato(
              icono: Icons.engineering_outlined,
              titulo: 'Mecánico',
              valor: orden.mecanicoAsignado?.nombre ?? 'Sin asignar',
            ),
            _Dato(
              icono: Icons.login,
              titulo: 'Ingreso',
              valor: _fecha(orden.fechaEntrada),
            ),
            _Dato(
              icono: Icons.event_outlined,
              titulo: 'Salida estimada',
              valor: _fecha(orden.fechaEstimadaSalida),
            ),
            _Dato(
              icono: Icons.speed,
              titulo: 'Kilometraje de ingreso',
              valor: '${orden.kilometrajeIngreso} km',
            ),
            const SizedBox(height: 8),
            const Text(
              'Problema reportado',
              style: TextStyle(color: AppColors.textMuted, fontSize: 13),
            ),
            const SizedBox(height: 4),
            Text(
              orden.problemaReportado.isEmpty
                  ? 'Sin descripción'
                  : orden.problemaReportado,
              style: const TextStyle(fontSize: 15, height: 1.4),
            ),
            if (diagnostico.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text(
                'Diagnóstico',
                style: TextStyle(color: AppColors.textMuted, fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                diagnostico,
                style: const TextStyle(fontSize: 15, height: 1.4),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _Dato extends StatelessWidget {
  final IconData icono;
  final String titulo;
  final String valor;

  const _Dato({required this.icono, required this.titulo, required this.valor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icono, size: 20, color: AppColors.textMuted),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              titulo,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 14),
            ),
          ),
          Flexible(
            child: Text(
              valor,
              textAlign: TextAlign.right,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Estados de carga, vacío y error
// ---------------------------------------------------------------------------

class _ResumenSkeleton extends StatelessWidget {
  const _ResumenSkeleton();

  @override
  Widget build(BuildContext context) {
    Widget bloque(double h) => Container(
      height: h,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.card),
      ),
    );
    return Semantics(
      label: 'Cargando resumen del taller',
      child: Column(
        children: [
          bloque(170),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: bloque(104)),
              const SizedBox(width: 10),
              Expanded(child: bloque(104)),
              const SizedBox(width: 10),
              Expanded(child: bloque(104)),
            ],
          ),
          const SizedBox(height: 28),
          bloque(76),
          const SizedBox(height: 10),
          bloque(76),
        ],
      ),
    );
  }
}

class _ListaVacia extends StatelessWidget {
  final bool hayFiltro;

  const _ListaVacia({required this.hayFiltro});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.card),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.garage_outlined,
            size: 36,
            color: AppColors.textMuted,
          ),
          const SizedBox(height: 10),
          Text(
            hayFiltro
                ? 'Ningún vehículo en este estado'
                : 'El taller está vacío',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 4),
          Text(
            hayFiltro
                ? 'Toca el estado otra vez para ver todos.'
                : 'Los vehículos aparecerán aquí al registrar una orden.',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }
}

class _AvisoError extends StatelessWidget {
  final String mensaje;
  final Future<void> Function() onReintentar;

  const _AvisoError({required this.mensaje, required this.onReintentar});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.card),
      ),
      child: Row(
        children: [
          const Icon(Icons.cloud_off, color: AppColors.error),
          const SizedBox(width: 12),
          Expanded(child: Text(mensaje, style: const TextStyle(fontSize: 14))),
          TextButton(onPressed: onReintentar, child: const Text('Reintentar')),
        ],
      ),
    );
  }
}

/// Feedback táctil: la tarjeta se hunde un poco al presionarla.
class _Pressable extends StatefulWidget {
  final Widget child;
  final VoidCallback onTap;

  const _Pressable({required this.child, required this.onTap});

  @override
  State<_Pressable> createState() => _PressableState();
}

class _PressableState extends State<_Pressable> {
  bool _presionado = false;

  @override
  Widget build(BuildContext context) {
    final reducirMovimiento = MediaQuery.of(context).disableAnimations;
    return Semantics(
      button: true,
      child: GestureDetector(
        onTapDown: (_) => setState(() => _presionado = true),
        onTapCancel: () => setState(() => _presionado = false),
        onTapUp: (_) => setState(() => _presionado = false),
        onTap: widget.onTap,
        child: AnimatedScale(
          scale: _presionado && !reducirMovimiento ? 0.97 : 1,
          duration: const Duration(milliseconds: 120),
          child: widget.child,
        ),
      ),
    );
  }
}
