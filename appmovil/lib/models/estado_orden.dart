enum EstadoOrden { recibido, enDiagnostico, enReparacion, listo, entregado }

extension EstadoOrdenJson on EstadoOrden {
  String get apiValue => switch (this) {
        EstadoOrden.recibido => 'RECIBIDO',
        EstadoOrden.enDiagnostico => 'EN_DIAGNOSTICO',
        EstadoOrden.enReparacion => 'EN_REPARACION',
        EstadoOrden.listo => 'LISTO',
        EstadoOrden.entregado => 'ENTREGADO',
      };

  String get etiqueta => switch (this) {
        EstadoOrden.recibido => 'Recibido',
        EstadoOrden.enDiagnostico => 'En diagnóstico',
        EstadoOrden.enReparacion => 'En reparación',
        EstadoOrden.listo => 'Listo',
        EstadoOrden.entregado => 'Entregado',
      };

  static EstadoOrden fromApiValue(String value) => switch (value) {
        'RECIBIDO' => EstadoOrden.recibido,
        'EN_DIAGNOSTICO' => EstadoOrden.enDiagnostico,
        'EN_REPARACION' => EstadoOrden.enReparacion,
        'LISTO' => EstadoOrden.listo,
        'ENTREGADO' => EstadoOrden.entregado,
        _ => EstadoOrden.recibido,
      };
}
