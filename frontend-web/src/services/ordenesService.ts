import type { OrdenDeTrabajo } from '../types'
import { ordenesMock } from '../mocks/ordenes'

// TODO(backend Fase 1): reemplazar por apiClient.get<OrdenDeTrabajo[]>('/ordenes-trabajo').
// Backend usa entidades JPA como response, no DTOs: cliente/vehiculo/mecanicoAsignado
// probablemente vienen anidados completos en vez de solo el id — confirmar con la
// sesión "backend" antes de conectar y ajustar el mapeo aquí (los types/mocks
// actuales usan *Id planos porque son solo para las vistas mock).

export async function listarOrdenes(): Promise<OrdenDeTrabajo[]> {
  return ordenesMock
}
